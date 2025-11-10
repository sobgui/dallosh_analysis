import { Response } from 'express';
import { BaseController } from '@common/controllers/BaseController';
import { FilesService } from './service';
import { AuthRequest } from '@common/middleware/auth';

export class FilesController extends BaseController {
  private filesService: FilesService;

  constructor(db: any) {
    super(db);
    this.filesService = new FilesService(db);
  }

  upload = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        this.error(res, 'No file uploaded', 400);
        return;
      }

      const createdBy = req.user?.uid || 'system';
      const fileDoc = await this.filesService.upload(file, createdBy);
      this.success(res, fileDoc, 'File uploaded successfully', 201);
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  findAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter as string) : {};
      const options = {
        sort: req.query.sort ? JSON.parse(req.query.sort as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        skip: req.query.skip ? parseInt(req.query.skip as string) : undefined,
      };

      const files = await this.filesService.findAll(filter, options);
      this.success(res, files, 'Files retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  findOne = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const file = await this.filesService.findOne(uid);

      if (!file) {
        this.error(res, 'File not found', 404);
        return;
      }

      this.success(res, file, 'File retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  download = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const source = typeof req.query.source === 'string' ? req.query.source : 'analysed';
      const contentDisposition = typeof req.query.contentDisposition === 'string' 
        ? req.query.contentDisposition 
        : 'attachment';

      if (!['inline', 'attachment'].includes(contentDisposition)) {
        this.error(res, 'Invalid contentDisposition. Must be "inline" or "attachment"', 400);
        return;
      }

      const fileInfo = await this.filesService.download(uid, source);

      if (!fileInfo) {
        this.error(res, 'File not found', 404);
        return;
      }

      const fs = require('fs');

      // Check if file exists
      if (!fs.existsSync(fileInfo.filePath)) {
        this.error(res, 'File not found on disk', 404);
        return;
      }

      // Set headers
      const disposition = contentDisposition === 'inline' ? 'inline' : 'attachment';
      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader(
        'Content-Disposition',
        `${disposition}; filename="${encodeURIComponent(fileInfo.filename)}"`
      );

      // Stream the file
      const fileStream = fs.createReadStream(fileInfo.filePath);
      fileStream.pipe(res);
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  delete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const source = typeof req.query.source === 'string' ? req.query.source : undefined;
      const deleted = await this.filesService.delete(uid, source);

      if (!deleted) {
        this.error(res, 'File not found', 404);
        return;
      }

      this.success(res, null, 'File deleted successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };
}

