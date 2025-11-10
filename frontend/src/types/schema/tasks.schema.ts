export type TaskStatus =
  | 'added'
  | 'in_queue'
  | 'reading_dataset'
  | 'reading_dataset_done'
  | 'process_cleaning'
  | 'process_cleaning_done'
  | 'sending_to_llm'
  | 'sending_to_llm_progression'
  | 'sending_to_llm_done'
  | 'appending_collumns'
  | 'appending_collumns_done'
  | 'saving_file'
  | 'saving_file_done'
  | 'done'
  | 'on_error'
  | 'paused'
  | 'stopped';

export interface TaskFileInfo {
  path: string | null;
  type: string | null;
}

export interface TaskData {
  file_id: string;
  file_path: string;
  status: TaskStatus;
  file_cleaned?: TaskFileInfo;
  file_analysed?: TaskFileInfo;
}

export interface Task {
  uid: string;
  data: TaskData;
  createdAt: Date | string;
  createdBy: string;
  updatedAt: Date | string;
  updatedBy: string;
}

export interface CreateTaskRequest {
  file_id: string;
  file_path: string;
  status?: TaskStatus;
}

export interface UpdateTaskRequest {
  file_id?: string;
  file_path?: string;
  status?: TaskStatus;
  file_cleaned?: TaskFileInfo;
  file_analysed?: TaskFileInfo;
}

export interface ProceedTaskRequest {
  fileId: string;
  filePath: string;
}

export interface RetryTaskRequest {
  fileId: string;
  filePath: string;
  lastEventStep: TaskStatus;
}

export interface HandleProcessRequest {
  fileId: string;
  event: 'pause' | 'resume' | 'stop';
}

// RabbitMQ Event Types
export interface TaskEventMessage {
  file_id: string;
  event: TaskStatus;
}

export interface TaskProgressionEventMessage extends TaskEventMessage {
  // Progression fields (from backend)
  batch?: number;           // Current batch number (1-indexed)
  total_batches?: number;   // Total number of batches
  batch_size?: number;      // Size of current batch
  total_rows?: number;      // Total number of rows in dataset
  rows_processed?: number;  // Number of rows processed so far
  rows_remaining?: number;  // Number of rows remaining
  progress_percentage?: number; // Progress percentage (0-100)
  current_row_index?: number;   // Current starting row index (1-indexed)
  current_row_end?: number;     // Current ending row index (inclusive)
  model_uid?: string;       // Model being used
  fallback_used?: boolean;  // Whether fallback model was used
  
  // Legacy/compatibility fields (mapped from backend fields)
  pagination?: number;      // Same as batch
  index?: number;           // Same as batch (or calculated from batch)
  total?: number;           // Same as total_batches
}

export type TaskEventCallback = (message: TaskEventMessage) => void;
export type TaskProgressionEventCallback = (message: TaskProgressionEventMessage) => void;

