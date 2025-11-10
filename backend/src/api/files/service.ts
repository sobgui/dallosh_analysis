import { BaseService } from '@common/services/BaseService';
import { File, FileData } from '@/types/schema/files.schema';
import { Task, TaskData } from '@/types/schema/tasks.schema';
import { generateUID } from '@utils';
import { COLLECTIONS, TASK_STATUS } from '@configs/constants';
import * as fs from 'fs/promises';
import * as path from 'path';
import { env } from '@configs/env';
import amqp from 'amqplib';

export class FilesService extends BaseService {
  private channel: amqp.Channel | null = null;
  private connection: any = null;

  private async connectRabbitMQ(): Promise<void> {
    try {
      if (!this.connection) {
        const conn = await amqp.connect(env.RABBITMQ_URL);
        this.connection = conn;
        this.channel = await conn.createChannel();
        if (this.channel) {
          await this.channel.assertExchange(env.RABBITMQ_TOPIC_TASKS, 'topic', { durable: true });
        }
      }
    } catch (error) {
      console.error('RabbitMQ connection error:', error);
      // Don't throw - allow file upload to continue even if RabbitMQ is down
    }
  }

  private async publishEvent(routingKey: string, message: any): Promise<void> {
    try {
      if (!this.channel) {
        await this.connectRabbitMQ();
      }
      if (this.channel) {
        this.channel.publish(
          env.RABBITMQ_TOPIC_TASKS,
          routingKey,
          Buffer.from(JSON.stringify(message)),
          { persistent: true }
        );
      }
    } catch (error) {
      console.error('Error publishing event:', error);
      // Don't throw - allow file upload to continue even if event publishing fails
    }
  }

  async upload(file: Express.Multer.File, createdBy: string): Promise<File> {
    const fileId = generateUID();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${fileId}${fileExtension}`;
    
    // Resolve storage path relative to backend directory, not current working directory
    // In compiled code, __dirname is /project/backend/dist/api/files, so we need to go up 3 levels
    const backendDir = path.resolve(__dirname, '../../..'); // Go up from dist/api/files to backend root
    const storagePath = env.STORAGE_PATH.startsWith('/') || env.STORAGE_PATH.match(/^[A-Z]:/) 
      ? env.STORAGE_PATH // Absolute path
      : path.resolve(backendDir, env.STORAGE_PATH); // Relative to backend directory
    
    // Ensure storage directory exists
    const storageDir = path.join(storagePath, 'datasets');
    await fs.mkdir(storageDir, { recursive: true });
    
    const filePath = path.join(storageDir, fileName);
    await fs.writeFile(filePath, file.buffer);

    const now = new Date();
    const fileData: FileData = {
      filename: file.originalname,
      size: file.size,
      file_path: filePath,
      extension: fileExtension,
      type: file.mimetype,
    };

    const fileDoc: File = {
      uid: fileId,
      data: fileData,
      createdAt: now,
      createdBy,
      updatedAt: now,
      updatedBy: createdBy,
    };

    await this.db.insertOne(COLLECTIONS.FILES, fileDoc);
    console.log(`[FilesService] File created: ${fileId}`);

    // Create task with status 'added' and emit 'added' event
    try {
      const taskData: TaskData = {
        file_id: fileId,
        file_path: filePath,
        status: TASK_STATUS.ADDED,
        file_cleaned: { path: null, type: null },
        file_analysed: { path: null, type: null },
      };

      const task: Task = {
        uid: generateUID(),
        data: taskData,
        createdAt: now,
        createdBy,
        updatedAt: now,
        updatedBy: createdBy,
      };

      await this.db.insertOne(COLLECTIONS.TASKS, task);
      console.log(`[FilesService] Task created: ${task.uid} for file: ${fileId} with status: ${TASK_STATUS.ADDED}`);
      
      // Verify task was actually created
      const verifyTask = await this.db.findOne(COLLECTIONS.TASKS, { 'data.file_id': fileId });
      if (!verifyTask) {
        console.error(`[FilesService] CRITICAL: Task was not found after creation for file ${fileId}`);
        throw new Error('Task creation verification failed - task not found in database');
      } else {
        console.log(`[FilesService] Task creation verified: ${verifyTask.uid}`);
      }

      // Emit 'added' event
      try {
        await this.publishEvent(TASK_STATUS.ADDED, {
          file_id: fileId,
          file_path: filePath,
          status: TASK_STATUS.ADDED,
        });
        console.log(`[FilesService] 'added' event published for file: ${fileId}`);
      } catch (eventError) {
        console.error(`[FilesService] Error publishing 'added' event:`, eventError);
        // Don't throw - task is created, event publishing failure is not critical
      }
    } catch (taskError) {
      console.error(`[FilesService] Error creating task for file ${fileId}:`, taskError);
      // Re-throw to ensure we know about task creation failures
      throw new Error(`Failed to create task: ${taskError instanceof Error ? taskError.message : String(taskError)}`);
    }

    return fileDoc;
  }

  async findAll(filter: any = {}, options: any = {}): Promise<File[]> {
    return (await this.db.findMany(COLLECTIONS.FILES, filter, options)) as File[];
  }

  async findOne(uid: string): Promise<File | null> {
    return (await this.db.findOne(COLLECTIONS.FILES, { uid })) as File | null;
  }

  /**
   * Get storage path resolved for backend container
   * This ensures we use the correct path regardless of how it's stored in the database
   */
  private getStoragePath(): string {
    const backendDir = path.resolve(__dirname, '../../..'); // Go up from dist/api/files to backend root
    return env.STORAGE_PATH.startsWith('/') || env.STORAGE_PATH.match(/^[A-Z]:/) 
      ? env.STORAGE_PATH // Absolute path
      : path.resolve(backendDir, env.STORAGE_PATH); // Relative to backend directory
  }

  /**
   * Resolve file path for cleaned/analysed files
   * Handles both relative paths (e.g., "cleaned/{file_id}.csv") and absolute paths for backward compatibility
   * Since both backend and microservice share the same volume but use different mount points,
   * we prefer relative paths stored in DB, but construct path from file_id as fallback
   */
  private resolveProcessedFilePath(fileId: string, source: 'cleaned' | 'analysed', storedPath?: string | null): string {
    const storagePath = this.getStoragePath();
    
    // Default constructed path: {storagePath}/{source}/{fileId}.csv
    const constructedPath = path.join(storagePath, source, `${fileId}.csv`);
    
    if (!storedPath) {
      // No stored path, use constructed path
      return constructedPath;
    }
    
    // Check if storedPath is already a relative path (new format)
    // Relative paths look like: "cleaned/{file_id}.csv" or "analysed/{file_id}.csv"
    if (!path.isAbsolute(storedPath)) {
      // It's a relative path, resolve it against storage path
      const resolvedPath = path.join(storagePath, storedPath);
      return resolvedPath;
    }
    
    // Stored path is absolute (old format from microservice)
    // Extract relative path from absolute path for cross-container compatibility
    // e.g., /project/auto_processing_datasets/storage/cleaned/{file_id}.csv -> cleaned/{file_id}.csv
    // e.g., /project/backend/storage/cleaned/{file_id}.csv -> cleaned/{file_id}.csv
    const storageMatch = storedPath.match(/[/\\](cleaned|analysed|datasets)[/\\]/);
    if (storageMatch) {
      const storageDir = storageMatch[1];
      const fileName = path.basename(storedPath);
      // Construct path using backend's storage path
      return path.join(storagePath, storageDir, fileName);
    }
    
    // If we can't extract relative path, check if absolute path exists (might be correct format)
    // Otherwise, fall back to constructed path
    return constructedPath;
  }

  async download(uid: string, source?: string): Promise<{ filePath: string; filename: string; mimeType: string } | null> {
    let normalizedSource = (source || 'analysed').toString().toLowerCase();
    if (normalizedSource === 'dataset') {
      normalizedSource = 'datasets';
    }
    if (!['datasets', 'cleaned', 'analysed'].includes(normalizedSource)) {
      normalizedSource = 'analysed';
    }

    if (normalizedSource === 'cleaned' || normalizedSource === 'analysed') {
      const task = (await this.db.findOne(COLLECTIONS.TASKS, {
        'data.file_id': uid,
      })) as any;

      if (!task) {
        return null;
      }

      const fileInfo =
        normalizedSource === 'cleaned' ? task?.data?.file_cleaned : task?.data?.file_analysed;
      const storedPath: string | null = fileInfo?.path ?? null;

      // Resolve file path - handles path format differences between microservice and backend
      // Since both share the same volume, we can construct the path reliably using file_id
      const targetPath = this.resolveProcessedFilePath(
        uid, 
        normalizedSource as 'cleaned' | 'analysed',
        storedPath
      );

      // Check if file exists at resolved path
      try {
        await fs.access(targetPath);
      } catch (error) {
        console.error(`[FilesService] File not found at ${targetPath} for file_id: ${uid}, source: ${normalizedSource}`);
        console.error(`[FilesService] Stored path in DB: ${storedPath || 'null'}`);
        return null;
      }

      // Get original file for filename
      const originalFile = await this.findOne(uid);
      const originalFilename = originalFile?.data.filename || `${uid}.csv`;
      const extension = path.extname(originalFilename);
      const baseFilename = path.basename(originalFilename, extension);
      const filename = `${baseFilename}_${normalizedSource}${extension}`;

      return {
        filePath: targetPath,
        filename,
        mimeType: 'text/csv',
      };
    }

    // For datasets, use the original file
    const file = await this.findOne(uid);
    if (!file) {
      return null;
    }

    // Resolve dataset file path (should already be correct from upload, but normalize for safety)
    let datasetPath = file.data.file_path;
    const storagePath = this.getStoragePath();
    
    // If path is relative or needs normalization, resolve it
    if (!path.isAbsolute(datasetPath) || !datasetPath.includes(storagePath)) {
      // Check if it's a relative path like "datasets/{file_id}.csv"
      if (datasetPath.includes('datasets')) {
        const fileName = path.basename(datasetPath);
        datasetPath = path.join(storagePath, 'datasets', fileName);
      } else if (!path.isAbsolute(datasetPath)) {
        // Relative path, resolve against storage
        datasetPath = path.join(storagePath, datasetPath);
      }
    }

    // Check if file exists
    try {
      await fs.access(datasetPath);
    } catch {
      console.error(`[FilesService] Dataset file not found at ${datasetPath} for file_id: ${uid}`);
      return null;
    }

    return {
      filePath: datasetPath,
      filename: file.data.filename,
      mimeType: file.data.type || 'text/csv',
    };
  }

  async delete(uid: string, source?: string): Promise<boolean> {
    let normalizedSource = (source || 'datasets').toString().toLowerCase();
    if (normalizedSource === 'dataset') {
      normalizedSource = 'datasets';
    }
    if (!['datasets', 'cleaned', 'analysed'].includes(normalizedSource)) {
      normalizedSource = 'datasets';
    }
    const now = new Date();

    if (normalizedSource === 'cleaned' || normalizedSource === 'analysed') {
      const task = (await this.db.findOne(COLLECTIONS.TASKS, {
        'data.file_id': uid,
      })) as any;

      if (!task) {
        return false;
      }

      const fileInfo =
        normalizedSource === 'cleaned' ? task?.data?.file_cleaned : task?.data?.file_analysed;
      const targetPath: string | null = fileInfo?.path ?? null;

      if (targetPath) {
        try {
          await fs.unlink(targetPath);
        } catch (error: any) {
          if (error?.code !== 'ENOENT') {
            console.error(`Error deleting ${normalizedSource} file:`, error);
            throw error;
          }
        }
      }

      const updatePayload: Record<string, any> = {
        updatedAt: now,
        updatedBy: 'system',
      };

      const baseKey = normalizedSource === 'cleaned' ? 'data.file_cleaned' : 'data.file_analysed';
      updatePayload[`${baseKey}.path`] = null;
      updatePayload[`${baseKey}.type`] = null;

      await this.db.updateOne(
        COLLECTIONS.TASKS,
        { 'data.file_id': uid },
        updatePayload
      );

      return true;
    }

    const file = await this.findOne(uid);
    if (file) {
      try {
        await fs.unlink(file.data.file_path);
      } catch (error: any) {
        if (error?.code !== 'ENOENT') {
          console.error('Error deleting dataset file:', error);
          throw error;
        }
      }
    }

    try {
      await this.db.updateOne(
        COLLECTIONS.TASKS,
        { 'data.file_id': uid },
        {
          'data.file_cleaned.path': null,
          'data.file_cleaned.type': null,
          'data.file_analysed.path': null,
          'data.file_analysed.type': null,
          updatedAt: now,
          updatedBy: 'system',
        }
      );
    } catch (error) {
      console.error('Warning: failed to update task metadata during dataset deletion:', error);
    }

    return await this.db.deleteOne(COLLECTIONS.FILES, { uid });
  }
}

