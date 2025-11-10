import apiClient from './client';
import { API_ENDPOINTS, TASK_EVENTS } from '@/configs/constant';
import { env } from '@/configs/env';
import { Client, IMessage } from '@stomp/stompjs';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  ProceedTaskRequest,
  RetryTaskRequest,
  HandleProcessRequest,
  TaskEventMessage,
  TaskProgressionEventMessage,
  TaskEventCallback,
  TaskProgressionEventCallback,
} from '@/types';

/**
 * Tasks Service
 * Handles task management API calls and RabbitMQ event listeners
 * 
 * Uses STOMP over WebSocket for client-side RabbitMQ connections.
 * Works in browser environments via WebSocket.
 */
class TasksService {
  private client: Client | null = null;
  private subscriptions: Map<string, any> = new Map(); // Map of fileId -> subscription
  private eventCallbacks: Map<string, TaskEventCallback[]> = new Map();
  private progressionCallbacks: Map<string, TaskProgressionEventCallback[]> = new Map();
  private isConnected: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  /**
   * Initialize RabbitMQ connection via STOMP over WebSocket
   */
  private async connect(): Promise<void> {
    // Return existing connection promise if already connecting
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Return if already connected
    if (this.isConnected && this.client?.connected) {
      return Promise.resolve();
    }

    // Create new connection promise
    this.connectionPromise = new Promise((resolve, reject) => {
      // Get credentials first (outside try block for error handler access)
      // Get credentials - treat empty strings as undefined
      const username = env.RABBITMQ_USERNAME && env.RABBITMQ_USERNAME.trim() !== '' 
        ? env.RABBITMQ_USERNAME.trim() 
        : undefined;
      const password = env.RABBITMQ_PASSWORD && env.RABBITMQ_PASSWORD.trim() !== '' 
        ? env.RABBITMQ_PASSWORD.trim() 
        : undefined;
      
      try {
        // Get WebSocket URL from env
        let wsUrl = env.RABBITMQ_URL;

        // Validate and normalize URL
        if (!wsUrl) {
          throw new Error('RabbitMQ URL is not configured. Please set NEXT_PUBLIC_RABBITMQ_URL');
        }

        // Normalize URL for localhost
        const isLocalhost = wsUrl.includes('localhost') || wsUrl.includes('127.0.0.1');
        
        // Ensure ws:// for localhost (wss:// requires SSL certificate)
        if (isLocalhost) {
          wsUrl = wsUrl.replace('wss://', 'ws://');
        }

        // Validate URL format
        if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
          throw new Error(`Invalid RabbitMQ WebSocket URL: ${wsUrl}. Must start with ws:// or wss://`);
        }

        // Build connect headers - only include credentials if both are provided
        // For localhost without credentials, connect anonymously
        const connectHeaders: Record<string, string> = {
          host: '/', // Virtual host - default is '/' in RabbitMQ
        };
        
        // Only add credentials if both username and password are provided
        if (username && password) {
          connectHeaders.login = username;
          connectHeaders.passcode = password;
        }

        console.log(`[RabbitMQ] Connecting to: ${wsUrl}`);
        if (username && password) {
          console.log(`[RabbitMQ] Using credentials: ${username}`);
        } else {
          console.log(`[RabbitMQ] No credentials (anonymous connection)`);
        }

        // Create STOMP client with proper configuration
        // RabbitMQ Web STOMP requires:
        // 1. host header for virtual host (default is '/')
        // 2. login/passcode for authentication (optional if RabbitMQ allows anonymous)
        this.client = new Client({
          brokerURL: wsUrl,
          connectHeaders: Object.keys(connectHeaders).length > 0 ? connectHeaders : undefined,
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          // Force WebSocket protocol (don't auto-upgrade)
          webSocketFactory: () => {
            return new WebSocket(wsUrl);
          },
          // Disable debug logging in production
          debug: (str) => {
            if (env.NODE_ENV === 'development') {
              console.log('[STOMP]', str);
            }
          },
          onConnect: () => {
            console.log(`[RabbitMQ] Connected to RabbitMQ via WebSocket STOMP at ${wsUrl}`);
            this.isConnected = true;
            this.connectionPromise = null;
            resolve();
          },
          onStompError: (frame) => {
            console.error('[RabbitMQ] STOMP error frame:', frame);
            // Try to get the error message from the frame
            let errorMessage = 'STOMP connection error';
            try {
              // The frame body might be a Uint8Array, so we need to decode it
              if (frame.body) {
                const body = frame.body as any;
                if (body && typeof body === 'object' && body.constructor === Uint8Array) {
                  errorMessage = new TextDecoder().decode(body);
                } else if (typeof body === 'string') {
                  errorMessage = body;
                } else {
                  // Try to convert to string
                  errorMessage = String(body);
                }
              }
              // Also check headers
              if (frame.headers && frame.headers['message']) {
                errorMessage = frame.headers['message'] || errorMessage;
              }
            } catch (e) {
              console.error('[RabbitMQ] Error parsing error frame:', e);
            }
            console.error(`[RabbitMQ] Error message: "${errorMessage}"`);
            console.error('[RabbitMQ] Error headers:', JSON.stringify(frame.headers, null, 2));
            console.error('[RabbitMQ] Troubleshooting steps:');
            if (username && password) {
              console.error('  1. Verify RabbitMQ credentials (username/password are correct)');
              console.error('  2. Check user has permissions to virtual host "/"');
              console.error('     Run: rabbitmqctl list_user_permissions <username>');
            } else {
              console.error('  1. RabbitMQ might require authentication');
              console.error('     Set NEXT_PUBLIC_RABBITMQ_USERNAME and NEXT_PUBLIC_RABBITMQ_PASSWORD');
              console.error('  2. Or enable anonymous access in RabbitMQ (not recommended for production)');
            }
            console.error('  3. Verify RabbitMQ Web STOMP plugin is enabled');
            console.error('     Run: rabbitmq-plugins list | grep web_stomp');
            console.error('  4. Check RabbitMQ is running and Web STOMP is listening on port 15674');
            console.error('  5. Verify virtual host "/" exists and is accessible');
            this.isConnected = false;
            this.connectionPromise = null;
            reject(new Error(errorMessage || 'Bad CONNECT - check credentials and permissions'));
          },
          onWebSocketError: (error) => {
            console.error(`[RabbitMQ] WebSocket error connecting to ${wsUrl}:`, error);
            console.error('[RabbitMQ] Make sure RabbitMQ Web STOMP plugin is enabled and running on the correct port');
            this.isConnected = false;
            this.connectionPromise = null;
            reject(error);
          },
          onDisconnect: () => {
            console.log('[RabbitMQ] Disconnected from RabbitMQ');
            this.isConnected = false;
            this.subscriptions.clear();
          },
        });

        // Activate client
        this.client.activate();
      } catch (error) {
        console.error('[RabbitMQ] Failed to initialize connection:', error);
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Handle task event
   */
  private handleEvent(message: TaskEventMessage): void {
    const callbacks = this.eventCallbacks.get(message.file_id) || [];
    callbacks.forEach((callback) => callback(message));

    // Also call global callbacks
    const globalCallbacks = this.eventCallbacks.get('*') || [];
    globalCallbacks.forEach((callback) => callback(message));
  }

  /**
   * Handle task progression event
   */
  private handleProgressionEvent(message: TaskProgressionEventMessage): void {
    const callbacks = this.progressionCallbacks.get(message.file_id) || [];
    callbacks.forEach((callback) => callback(message));

    // Also call global callbacks
    const globalCallbacks = this.progressionCallbacks.get('*') || [];
    globalCallbacks.forEach((callback) => callback(message));
  }

  /**
   * Listen to task events for a specific file
   */
  async onTaskEvent(fileId: string, callback: TaskEventCallback): Promise<void> {
    await this.connect();
    
    if (!this.client?.connected) {
      throw new Error('RabbitMQ client is not connected');
    }

    // Register callback
    if (!this.eventCallbacks.has(fileId)) {
      this.eventCallbacks.set(fileId, []);
    }
    this.eventCallbacks.get(fileId)!.push(callback);

    // Subscribe to exchange with routing key pattern
    // STOMP destination format for topic exchange: /exchange/{exchange_name}/{routing_key}
    // Routing key pattern: {fileId}.* matches all events for this file
    const destination = `/exchange/${env.RABBITMQ_TOPIC_TASKS}/${fileId}.*`;
    
    // Only subscribe if not already subscribed
    if (!this.subscriptions.has(`event:${fileId}`)) {
      console.log(`[RabbitMQ] Subscribing to events for file ${fileId} on destination: ${destination}`);
      const subscription = this.client.subscribe(destination, (message: IMessage) => {
        try {
          const content = message.body;
          if (!content) {
            console.warn('[RabbitMQ] Received empty message');
            return;
          }
          
          const parsedMessage: any = JSON.parse(content);
          console.log(`[RabbitMQ] Received event for file ${parsedMessage.file_id}:`, parsedMessage.event);

          // Handle progression events
          if (parsedMessage.event === TASK_EVENTS.SENDING_TO_LLM_PROGRESSION) {
            // Map backend fields to frontend expected fields for compatibility
            const progressionMessage: TaskProgressionEventMessage = {
              file_id: parsedMessage.file_id,
              event: parsedMessage.event,
              batch: parsedMessage.batch,
              total_batches: parsedMessage.total_batches,
              batch_size: parsedMessage.batch_size,
              total_rows: parsedMessage.total_rows,
              rows_processed: parsedMessage.rows_processed,
              rows_remaining: parsedMessage.rows_remaining,
              progress_percentage: parsedMessage.progress_percentage,
              current_row_index: parsedMessage.current_row_index,
              current_row_end: parsedMessage.current_row_end,
              model_uid: parsedMessage.model_uid,
              fallback_used: parsedMessage.fallback_used,
              // Legacy/compatibility fields
              pagination: parsedMessage.batch || parsedMessage.pagination,
              index: parsedMessage.batch || parsedMessage.index,
              total: parsedMessage.total_batches || parsedMessage.total,
            };
            this.handleProgressionEvent(progressionMessage);
          } else {
            // Handle regular events
            const eventMessage: TaskEventMessage = {
              file_id: parsedMessage.file_id,
              event: parsedMessage.event,
            };
            this.handleEvent(eventMessage);
          }
        } catch (error) {
          console.error('[RabbitMQ] Error processing message:', error, message.body);
        }
      });

      this.subscriptions.set(`event:${fileId}`, subscription);
      console.log(`[RabbitMQ] Successfully subscribed to events for file ${fileId}`);
    }
  }

  /**
   * Listen to task progression events for a specific file
   */
  async onTaskProgression(
    fileId: string,
    callback: TaskProgressionEventCallback
  ): Promise<void> {
    await this.connect();
    
    if (!this.client?.connected) {
      throw new Error('RabbitMQ client is not connected');
    }

    // Register callback
    if (!this.progressionCallbacks.has(fileId)) {
      this.progressionCallbacks.set(fileId, []);
    }
    this.progressionCallbacks.get(fileId)!.push(callback);

    // Subscribe to progression events
    // The subscription is already handled in onTaskEvent, but we ensure callback is registered
    // Progression events use the same routing pattern but are filtered by event type
  }

  /**
   * Listen to all task events
   */
  async onAllTaskEvents(callback: TaskEventCallback): Promise<void> {
    await this.connect();
    
    if (!this.client?.connected) {
      throw new Error('RabbitMQ client is not connected');
    }

    // Register global callback
    if (!this.eventCallbacks.has('*')) {
      this.eventCallbacks.set('*', []);
    }
    this.eventCallbacks.get('*')!.push(callback);

    // Subscribe to all events with wildcard routing key
    if (!this.subscriptions.has('event:*')) {
      const destination = `/exchange/${env.RABBITMQ_TOPIC_TASKS}/#`;
      
      const subscription = this.client.subscribe(destination, (message: IMessage) => {
        try {
          const content = message.body;
          const parsedMessage: any = JSON.parse(content);

          // Handle progression events
          if (parsedMessage.event === TASK_EVENTS.SENDING_TO_LLM_PROGRESSION) {
            // Map backend fields to frontend expected fields for compatibility
            const progressionMessage: TaskProgressionEventMessage = {
              file_id: parsedMessage.file_id,
              event: parsedMessage.event,
              batch: parsedMessage.batch,
              total_batches: parsedMessage.total_batches,
              batch_size: parsedMessage.batch_size,
              model_uid: parsedMessage.model_uid,
              fallback_used: parsedMessage.fallback_used,
              // Legacy/compatibility fields
              pagination: parsedMessage.batch || parsedMessage.pagination,
              index: parsedMessage.batch || parsedMessage.index,
              total: parsedMessage.total_batches || parsedMessage.total,
            };
            this.handleProgressionEvent(progressionMessage);
          } else {
            // Handle regular events
            const eventMessage: TaskEventMessage = {
              file_id: parsedMessage.file_id,
              event: parsedMessage.event,
            };
            this.handleEvent(eventMessage);
          }
        } catch (error) {
          console.error('Error processing RabbitMQ message:', error);
        }
      });

      this.subscriptions.set('event:*', subscription);
    }
  }

  /**
   * Remove event listener and unsubscribe if no more callbacks
   */
  offTaskEvent(fileId: string, callback?: TaskEventCallback): void {
    if (!callback) {
      // Remove all callbacks for this file
      this.eventCallbacks.delete(fileId);
      // Unsubscribe from RabbitMQ
      const subscriptionKey = `event:${fileId}`;
      const subscription = this.subscriptions.get(subscriptionKey);
      if (subscription) {
        subscription.unsubscribe();
        this.subscriptions.delete(subscriptionKey);
        console.log(`[RabbitMQ] Unsubscribed from events for file ${fileId}`);
      }
      return;
    }

    // Remove specific callback
    const callbacks = this.eventCallbacks.get(fileId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      // If no more callbacks, unsubscribe
      if (callbacks.length === 0) {
        this.eventCallbacks.delete(fileId);
        const subscriptionKey = `event:${fileId}`;
        const subscription = this.subscriptions.get(subscriptionKey);
        if (subscription) {
          subscription.unsubscribe();
          this.subscriptions.delete(subscriptionKey);
          console.log(`[RabbitMQ] Unsubscribed from events for file ${fileId}`);
        }
      }
    }
  }

  /**
   * Remove progression event listener
   */
  offTaskProgression(fileId: string, callback?: TaskProgressionEventCallback): void {
    if (!callback) {
      this.progressionCallbacks.delete(fileId);
      return;
    }

    const callbacks = this.progressionCallbacks.get(fileId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Disconnect from RabbitMQ
   */
  async disconnect(): Promise<void> {
    // Unsubscribe all
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();

    // Deactivate client
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.isConnected = false;
    this.eventCallbacks.clear();
    this.progressionCallbacks.clear();
    this.connectionPromise = null;
  }

  /**
   * Create a new task
   */
  async create(data: CreateTaskRequest): Promise<Task> {
    const response = await apiClient.post<{ success: boolean; data: Task; message: string }>(
      API_ENDPOINTS.TASKS.BASE,
      data
    );
    return response.data;
  }

  /**
   * Get all tasks
   */
  async findAll(filter?: Record<string, any>, options?: {
    sort?: Record<string, any>;
    limit?: number;
    skip?: number;
  }): Promise<Task[]> {
    const params = new URLSearchParams();
    
    if (filter) {
      params.append('filter', JSON.stringify(filter));
    }
    if (options?.sort) {
      params.append('sort', JSON.stringify(options.sort));
    }
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options?.skip) {
      params.append('skip', options.skip.toString());
    }

    const response = await apiClient.get<{ success: boolean; data: Task[]; message: string }>(
      `${API_ENDPOINTS.TASKS.BASE}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get task by ID
   */
  async findOne(uid: string): Promise<Task> {
    const response = await apiClient.get<{ success: boolean; data: Task; message: string }>(
      API_ENDPOINTS.TASKS.BY_ID(uid)
    );
    return response.data;
  }

  /**
   * Update task
   */
  async update(uid: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await apiClient.patch<{ success: boolean; data: Task; message: string }>(
      API_ENDPOINTS.TASKS.BY_ID(uid),
      data
    );
    return response.data;
  }

  /**
   * Delete task
   */
  async delete(uid: string): Promise<void> {
    await apiClient.delete<{ success: boolean; data: null; message: string }>(
      API_ENDPOINTS.TASKS.BY_ID(uid)
    );
  }

  /**
   * Proceed with task processing
   */
  async proceed(data: ProceedTaskRequest): Promise<void> {
    await apiClient.post<{ success: boolean; data: null; message: string }>(
      API_ENDPOINTS.TASKS.PROCEED,
      data
    );
  }

  /**
   * Retry task from a specific step
   */
  async retry(data: RetryTaskRequest): Promise<void> {
    await apiClient.post<{ success: boolean; data: null; message: string }>(
      API_ENDPOINTS.TASKS.RETRY,
      data
    );
  }

  /**
   * Handle process (pause/resume/stop)
   */
  async handleProcess(data: HandleProcessRequest): Promise<void> {
    await apiClient.post<{ success: boolean; data: null; message: string }>(
      API_ENDPOINTS.TASKS.HANDLE_PROCESS,
      data
    );
  }

  /**
   * Restart task (delete cleaned/analysed files and reset to 'added' status)
   */
  async restart(fileId: string): Promise<Task> {
    const response = await apiClient.post<{ success: boolean; data: Task; message: string }>(
      API_ENDPOINTS.TASKS.RESTART,
      { fileId }
    );
    return response.data;
  }

  /**
   * Delete task with associated files
   */
  async deleteWithFiles(fileId: string): Promise<void> {
    await apiClient.post<{ success: boolean; data: null; message: string }>(
      API_ENDPOINTS.TASKS.DELETE_WITH_FILES,
      { fileId }
    );
  }
}

export const tasksService = new TasksService();

