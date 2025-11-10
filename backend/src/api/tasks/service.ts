import { BaseService } from '@common/services/BaseService';
import { Task, TaskData, TaskStatus } from '@/types/schema/tasks.schema';
import { generateUID } from '@utils';
import { COLLECTIONS, RABBITMQ_EVENTS, TASK_STATUS } from '@configs/constants';
import amqp from 'amqplib';
import { env } from '@configs/env';
import { Settings } from '@/types/schema/settings.schema';

export class TasksService extends BaseService {
  private channel: amqp.Channel | null = null;
  private connection: any = null;

  async connectRabbitMQ(): Promise<void> {
    try {
      const conn = await amqp.connect(env.RABBITMQ_URL);
      this.connection = conn;
      this.channel = await conn.createChannel();
      if (this.channel) {
        await this.channel.assertExchange(env.RABBITMQ_TOPIC_TASKS, 'topic', { durable: true });
        console.log('Connected to RabbitMQ');
      }
    } catch (error) {
      console.error('RabbitMQ connection error:', error);
      throw error;
    }
  }

  async disconnectRabbitMQ(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  private async publishEvent(routingKey: string, message: any): Promise<void> {
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
  }

  async create(taskData: TaskData, createdBy: string): Promise<Task> {
    const now = new Date();
    const task: Task = {
      uid: generateUID(),
      data: {
        ...taskData,
        file_cleaned: taskData.file_cleaned ?? { path: null, type: null },
        file_analysed: taskData.file_analysed ?? { path: null, type: null },
      },
      createdAt: now,
      createdBy,
      updatedAt: now,
      updatedBy: createdBy,
    };

    await this.db.insertOne(COLLECTIONS.TASKS, task);

    // Emit 'added' event to frontend as per project specification
    // Event format: {file_id, file_path}
    // Routing key format: {fileId}.{event} for frontend subscription
    if (taskData.file_id && taskData.file_path) {
      await this.publishEvent(`${taskData.file_id}.${TASK_STATUS.ADDED}`, {
        file_id: taskData.file_id,
        file_path: taskData.file_path,
      });
    }

    return task;
  }

  async findAll(filter: any = {}, options: any = {}): Promise<Task[]> {
    return (await this.db.findMany(COLLECTIONS.TASKS, filter, options)) as Task[];
  }

  async findOne(uid: string): Promise<Task | null> {
    return (await this.db.findOne(COLLECTIONS.TASKS, { uid })) as Task | null;
  }

  async update(uid: string, updates: Partial<TaskData>, updatedBy: string): Promise<Task | null> {
    const updateData: any = {};
    if (updates.file_id !== undefined) updateData['data.file_id'] = updates.file_id;
    if (updates.file_path !== undefined) updateData['data.file_path'] = updates.file_path;
    if (updates.status !== undefined) updateData['data.status'] = updates.status;

    if (updates.file_cleaned) {
      if (Object.prototype.hasOwnProperty.call(updates.file_cleaned, 'path')) {
        updateData['data.file_cleaned.path'] = updates.file_cleaned!.path;
      }
      if (Object.prototype.hasOwnProperty.call(updates.file_cleaned, 'type')) {
        updateData['data.file_cleaned.type'] = updates.file_cleaned!.type;
      }
    }

    if (updates.file_analysed) {
      if (Object.prototype.hasOwnProperty.call(updates.file_analysed, 'path')) {
        updateData['data.file_analysed.path'] = updates.file_analysed!.path;
      }
      if (Object.prototype.hasOwnProperty.call(updates.file_analysed, 'type')) {
        updateData['data.file_analysed.type'] = updates.file_analysed!.type;
      }
    }

    updateData.updatedAt = new Date();
    updateData.updatedBy = updatedBy;

    await this.db.updateOne(COLLECTIONS.TASKS, { uid }, updateData);
    return await this.findOne(uid);
  }

  async delete(uid: string): Promise<boolean> {
    return await this.db.deleteOne(COLLECTIONS.TASKS, { uid });
  }

  async proceedTask(fileId: string, filePath: string): Promise<void> {
    // Get AI settings
    const settings = (await this.db.findOne(COLLECTIONS.SETTINGS, {})) as Settings | null;
    
    if (!settings) {
      throw new Error('Settings not found');
    }

    // Ensure AI settings exist
    if (!settings.data.ai) {
      throw new Error('AI settings not configured. Please update settings first.');
    }

    // Find or create task
    let task = await this.db.findOne(COLLECTIONS.TASKS, { 'data.file_id': fileId }) as Task | null;
    
    if (!task) {
      // Create task if it doesn't exist
      const taskData: TaskData = {
        file_id: fileId,
        file_path: filePath,
        status: TASK_STATUS.ADDED,
        file_cleaned: { path: null, type: null },
        file_analysed: { path: null, type: null },
      };
      task = await this.create(taskData, 'system');
    }

    // Update task status to in_queue in database
    // The microservice will emit the in_queue event to the frontend after receiving proceed_task
    await this.update(task.uid, { status: TASK_STATUS.IN_QUEUE }, 'system');

    // Publish proceed_task control event to microservice
    // Routing key: 'proceed_task' (control event for microservice listener)
    await this.publishEvent(RABBITMQ_EVENTS.PROCEED_TASK, {
      file_id: fileId,
      file_path: filePath,
      ai: {
        preferences: settings.data.ai.preferences || {},
        local: settings.data.ai.local || [],
        external: settings.data.ai.external || [],
      },
    });
  }

  async retryStep(fileId: string, filePath: string, lastEventStep: TaskStatus): Promise<void> {
    const settings = (await this.db.findOne(COLLECTIONS.SETTINGS, {})) as Settings | null;
    
    if (!settings) {
      throw new Error('Settings not found');
    }

    if (!settings.data.ai) {
      throw new Error('AI settings not configured. Please update settings first.');
    }

    await this.publishEvent(RABBITMQ_EVENTS.RETRY_STEP, {
      file_id: fileId,
      file_path: filePath,
      last_event_step: lastEventStep,
      ai: {
        preferences: settings.data.ai.preferences || {},
        local: settings.data.ai.local || [],
        external: settings.data.ai.external || [],
      },
    });
  }

  async handleProcess(fileId: string, event: 'pause' | 'resume' | 'stop'): Promise<void> {
    await this.publishEvent(RABBITMQ_EVENTS.HANDLE_PROCESS, {
      file_id: fileId,
      event,
    });
  }

  async restartTask(fileId: string): Promise<Task | null> {
    // Find task
    const task = await this.db.findOne(COLLECTIONS.TASKS, { 'data.file_id': fileId }) as Task | null;
    if (!task) {
      throw new Error('Task not found');
    }

    // Delete cleaned and analysed files
    const { FilesService } = await import('../files/service');
    const filesService = new FilesService(this.db);
    
    try {
      if (task.data.file_cleaned?.path) {
        await filesService.delete(fileId, 'cleaned');
      }
    } catch (error) {
      console.error('Error deleting cleaned file:', error);
    }

    try {
      if (task.data.file_analysed?.path) {
        await filesService.delete(fileId, 'analysed');
      }
    } catch (error) {
      console.error('Error deleting analysed file:', error);
    }

    // Reset task status to 'added' and clear file paths
    const updatedTask = await this.update(task.uid, {
      status: TASK_STATUS.ADDED,
      file_cleaned: { path: null, type: null },
      file_analysed: { path: null, type: null },
    }, 'system');

    // Don't emit status events - only the microservice emits status events to the frontend
    // If frontend needs immediate feedback, it can poll the task status or wait for microservice events

    return updatedTask;
  }

  async deleteTaskWithFiles(fileId: string): Promise<boolean> {
    // Find task
    const task = await this.db.findOne(COLLECTIONS.TASKS, { 'data.file_id': fileId }) as Task | null;
    if (!task) {
      return false;
    }

    // Delete cleaned and analysed files
    const { FilesService } = await import('../files/service');
    const filesService = new FilesService(this.db);
    
    try {
      if (task.data.file_cleaned?.path) {
        await filesService.delete(fileId, 'cleaned');
      }
    } catch (error) {
      console.error('Error deleting cleaned file:', error);
    }

    try {
      if (task.data.file_analysed?.path) {
        await filesService.delete(fileId, 'analysed');
      }
    } catch (error) {
      console.error('Error deleting analysed file:', error);
    }

    // Delete task
    return await this.delete(task.uid);
  }
}

