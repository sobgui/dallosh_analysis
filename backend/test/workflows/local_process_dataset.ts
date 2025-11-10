/**
 * Workflow test for local dataset processing
 * 
 * This test:
 * 1. Launches the backend server
 * 2. Logs in as admin to get token
 * 3. Updates settings for local LLM mode
 * 4. Uploads a CSV file
 * 5. Creates a task
 * 6. Sends proceed_task request
 * 7. Listens to events/logs to verify the workflow
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import bootstrap from '../../src/main';
import { generateUID } from '../../src/utils';
import amqp from 'amqplib';
import Papa from 'papaparse';

// Setup logging
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_FILE = path.join(LOG_DIR, `workflow-${new Date().toISOString().replace(/:/g, '-')}.log`);

function log(message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  // Write to file
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
  
  // Also log to console
  if (level === 'ERROR') {
    console.error(logMessage);
  } else if (level === 'WARN') {
    console.warn(logMessage);
  } else {
    console.log(logMessage);
  }
}

const BASE_URL = 'http://localhost:5006/api';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const RABBITMQ_TOPIC_TASKS = process.env.RABBITMQ_TOPIC_TASKS || 'tasks';

// Test credentials (using default admin from system initialization)
const TEST_EMAIL = 'admin@dallosh.com';
const TEST_PASSWORD = 'admin123';

// File path
const TEST_FILE_PATH = path.join(__dirname, '../storage/datasets/dataset_free_tweet_export.csv');
const STORAGE_BASE = path.join(__dirname, '../../storage');

// models
const MODELS = [
  {
    uid: 'qwen3:1.7b',
    model: 'qwen3:1.7b',
    baseUrl: 'http://localhost:11434',
    apiKey: 'ollama',
  },
  {
    uid: 'llama3.2:1b',
    model: 'llama3.2:1b',
    baseUrl: 'http://localhost:11434',
    apiKey: 'ollama',
  },
];

const DEFAULT_MODEL = MODELS[1];

interface LoginResponse {
  success: boolean;
  data: {
    user: any;
    token: string;
  };
}

interface FileResponse {
  success: boolean;
  data: {
    uid: string;
    data: {
      filename: string;
      file_path: string;
      size: number;
      extension: string;
      type: string;
    };
  };
}

interface TaskResponse {
  success: boolean;
  data: {
    uid: string;
    data: {
      file_id: string;
      file_path: string;
      status: string;
    };
  };
}

class WorkflowTest {
  private token: string = '';
  private fileId: string = '';
  private taskId: string = '';
  private rabbitmqConnection: any = null;
  private rabbitmqChannel: amqp.Channel | null = null;
  private events: Array<{ file_id: string; event: string; timestamp: Date; data?: Record<string, any> }> = [];
  private datasetFilePath: string = '';
  private cleanedFilePath: string = '';
  private analysedFilePath: string = '';

  async setupRabbitMQListener(): Promise<void> {
    try {
      log('Setting up RabbitMQ listener...');
      const connection = await amqp.connect(RABBITMQ_URL);
      this.rabbitmqConnection = connection;
      const channel = await connection.createChannel();
      this.rabbitmqChannel = channel;
      
      // Declare exchange
      await channel.assertExchange(RABBITMQ_TOPIC_TASKS, 'topic', { durable: true });
      log(`Exchange declared: ${RABBITMQ_TOPIC_TASKS}`);
      
      // Create queue for events
      const queue = await channel.assertQueue('', { exclusive: true });
      log(`Queue created: ${queue.queue}`);
      
      // Bind to all task events (use # for topic exchange to match all routing keys)
      await channel.bindQueue(
        queue.queue,
        RABBITMQ_TOPIC_TASKS,
        '#' // Listen to all events (wildcard for topic exchange)
      );
      
      log('✓ Connected to RabbitMQ and listening for events...');
      
      // Consume messages
      await channel.consume(queue.queue, (msg) => {
        if (msg && this.rabbitmqChannel) {
          try {
            const content = JSON.parse(msg.content.toString());
            const routingKey = msg.fields.routingKey;
            const eventName = routingKey || content.event || 'unknown';
            const fileId = content.file_id || 'unknown';
            const payload = { ...content };
            delete payload.file_id;
            delete payload.event;

            this.events.push({
              file_id: fileId,
              event: eventName,
              timestamp: new Date(),
              data: Object.keys(payload).length ? payload : undefined,
            });

            const extraData = Object.keys(payload).length ? ` | data=${JSON.stringify(payload)}` : '';
            const eventMsg = `[EVENT] ${eventName}: file_id=${fileId}${extraData}`;
            log(eventMsg);
            console.log(`\n${eventMsg}`);
            
            this.rabbitmqChannel.ack(msg);
          } catch (error: any) {
            log(`Error parsing event: ${error.message}`, 'ERROR');
            if (this.rabbitmqChannel && msg) {
              this.rabbitmqChannel.nack(msg, false, false);
            }
          }
        }
      });
    } catch (error: any) {
      log(`Failed to setup RabbitMQ listener: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async login(): Promise<void> {
    log('\n=== Step 1: Login ===');
    try {
      log(`Attempting login with email: ${TEST_EMAIL}`);
      const response = await axios.post<LoginResponse>(`${BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      if (response.data.success && response.data.data.token) {
        this.token = response.data.data.token;
        log('✓ Login successful');
        log(`  User: ${response.data.data.user.email}`);
        log(`  Token: ${this.token.substring(0, 20)}...`);
      } else {
        throw new Error('Login failed: Invalid response');
      }
    } catch (error: any) {
      const errorMsg = `✗ Login failed: ${JSON.stringify(error.response?.data || error.message)}`;
      log(errorMsg, 'ERROR');
      throw error;
    }
  }

  async updateSettings(): Promise<void> {
    log('\n=== Step 2: Update Settings for Local LLM ===');
    try {
      // First, get current settings
      const getResponse = await axios.get(`${BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      if (!getResponse.data.success) {
        throw new Error('Failed to get settings');
      }

      const settings = getResponse.data.data;
      const modelUid = generateUID();

      // Ensure settings.data exists
      if (!settings.data) {
        settings.data = {};
      }

      // Ensure settings.data.ai exists
      if (!settings.data.ai) {
        settings.data.ai = {
          preferences: {},
          local: [],
          external: [],
        };
      }

      // Ensure preferences exist
      if (!settings.data.ai.preferences) {
        settings.data.ai.preferences = {};
      }

      // Update settings with local LLM configuration
      const updatedSettings = {
        ...settings,
        data: {
          ...settings.data,
          ai: {
            ...settings.data.ai,
            preferences: {
              ...settings.data.ai.preferences,
              mode: 'local',
              default_local_model_id: modelUid,
            },
            local: [
              ...(settings.data.ai.local || []),
              {
                uid: modelUid,
                data: {
                  //model: 'qwen3:1.7b-fp16',
                  model: DEFAULT_MODEL.model,
                  // baseUrl: 'http://192.168.1.117:11434',
                  baseUrl: DEFAULT_MODEL.baseUrl,
                  apiKey: DEFAULT_MODEL.apiKey,
                  retryRequests: 3,
                  paginateRowsLimit: 500,
                },
                createdAt: new Date(),
                createdBy: 'system',
                updatedAt: new Date(),
                updatedBy: 'system',
              },
            ],
          },
        },
      };

      // Send only the data field, not the full settings object
      const updateResponse = await axios.patch(
        `${BASE_URL}/settings`,
        updatedSettings.data, // Send only the data field
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );

      if (updateResponse.data.success) {
        log('✓ Settings updated successfully');
        log(`  Mode: ${updatedSettings.data.ai.preferences.mode}`);
        log(`  Model UID: ${modelUid}`);
        log(`  Model: ${updatedSettings.data.ai.local[updatedSettings.data.ai.local.length - 1].data.model}`);
        
        // Wait a moment for database to commit the update
        log('  Waiting 500ms for database to commit settings...');
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Verify settings were saved correctly
        const verifyResponse = await axios.get(`${BASE_URL}/settings`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        
        if (verifyResponse.data.success && verifyResponse.data.data?.data?.ai) {
          log('  ✓ Settings verified in database');
        } else {
          log('  ⚠ Warning: Settings verification failed', 'WARN');
        }
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error: any) {
      log(`✗ Settings update failed: ${JSON.stringify(error.response?.data || error.message)}`, 'ERROR');
      throw error;
    }
  }

  async uploadFile(): Promise<void> {
    log('\n=== Step 3: Upload File ===');
    try {
      if (!fs.existsSync(TEST_FILE_PATH)) {
        throw new Error(`Test file not found: ${TEST_FILE_PATH}`);
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(TEST_FILE_PATH));

      const response = await axios.post<FileResponse>(`${BASE_URL}/files/upload`, formData, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (response.data.success && response.data.data) {
        this.fileId = response.data.data.uid;
        const filePath = response.data.data.data.file_path;
        log('✓ File uploaded successfully');
        log(`  File ID: ${this.fileId}`);
        log(`  Filename: ${response.data.data.data.filename}`);
        log(`  Size: ${response.data.data.data.size} bytes`);
        log(`  Path: ${filePath}`);

        // Verify file exists in storage (use the actual file_path from response)
        const actualFilePath = filePath; // This is the absolute path from the backend
        if (fs.existsSync(actualFilePath)) {
          log(`  ✓ File verified at: ${actualFilePath}`);
          this.datasetFilePath = actualFilePath;
        } else {
          log(`  ⚠ File not found at: ${actualFilePath}`, 'WARN');
          // Also check the expected path
          const expectedPath = path.join(STORAGE_BASE, 'datasets', `${this.fileId}.csv`);
          if (fs.existsSync(expectedPath)) {
            log(`  ✓ File found at alternative path: ${expectedPath}`);
            this.datasetFilePath = expectedPath;
          } else {
            log(`  ⚠ File also not found at expected path: ${expectedPath}`, 'WARN');
            this.datasetFilePath = expectedPath;
          }
        }

        if (!this.datasetFilePath) {
          this.datasetFilePath = actualFilePath;
        }

        await this.previewDataFrame('Uploaded dataset (datasets)', this.datasetFilePath);
      } else {
        throw new Error('File upload failed: Invalid response');
      }
    } catch (error: any) {
      log(`✗ File upload failed: ${JSON.stringify(error.response?.data || error.message)}`, 'ERROR');
      throw error;
    }
  }

  async createTask(): Promise<void> {
    log('\n=== Step 4: Create Task ===');
    try {
      // Get the actual file path from the uploaded file
      const fileResponse = await axios.get(`${BASE_URL}/files/${this.fileId}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      
      const actualFilePath = fileResponse.data.success 
        ? fileResponse.data.data.data.file_path 
        : path.join(STORAGE_BASE, 'datasets', `${this.fileId}.csv`);

      const response = await axios.post<TaskResponse>(
        `${BASE_URL}/tasks`,
        {
          file_id: this.fileId,
          file_path: actualFilePath, // Use the actual file path from the backend
          status: 'added',
        },
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );

      if (response.data.success && response.data.data) {
        this.taskId = response.data.data.uid;
        log('✓ Task created successfully');
        log(`  Task ID: ${this.taskId}`);
        log(`  File ID: ${this.fileId}`);
        log(`  Status: ${response.data.data.data.status}`);
      } else {
        throw new Error('Task creation failed: Invalid response');
      }
    } catch (error: any) {
      log(`✗ Task creation failed: ${JSON.stringify(error.response?.data || error.message)}`, 'ERROR');
      throw error;
    }
  }

  async proceedTask(): Promise<void> {
    log('\n=== Step 5: Proceed Task ===');
    try {
      // Get task to get file_id and file_path
      const taskResponse = await axios.get(`${BASE_URL}/tasks/${this.taskId}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      if (!taskResponse.data.success) {
        throw new Error('Failed to get task');
      }

      const task = taskResponse.data.data;
      const fileId = task.data.file_id;
      const filePath = task.data.file_path;

      const response = await axios.post(
        `${BASE_URL}/tasks/proceed`,
        {
          fileId,
          filePath,
        },
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );

      if (response.data.success) {
        log('✓ Proceed task request sent successfully');
        log('  Waiting for microservice to process...');
      } else {
        throw new Error('Proceed task failed: Invalid response');
      }
    } catch (error: any) {
      log(`✗ Proceed task failed: ${JSON.stringify(error.response?.data || error.message)}`, 'ERROR');
      throw error;
    }
  }

  private async previewDataFrame(label: string, filePath: string): Promise<void> {
    if (!filePath) {
      log(`  ⚠ Cannot preview ${label}: file path not set`, 'WARN');
      return;
    }

    if (!fs.existsSync(filePath)) {
      log(`  ⚠ Cannot preview ${label}: file not found at ${filePath}`, 'WARN');
      return;
    }

    try {
      // Read CSV file
      const csvContent = fs.readFileSync(filePath, 'utf-8');
      
      // Parse CSV
      const parseResult = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      if (!parseResult.data || parseResult.data.length === 0) {
        log(`  ⚠ ${label} is empty`, 'WARN');
        return;
      }

      // Get headers
      const headers = Object.keys(parseResult.data[0] as Record<string, any>);
      
      // Get first 5 rows
      const rows = parseResult.data.slice(0, 5) as Record<string, any>[];

      // Format as table
      let preview = '\n';
      
      // Print headers
      const headerRow = headers.join(' | ');
      preview += headerRow + '\n';
      preview += '-'.repeat(headerRow.length) + '\n';
      
      // Print rows
      for (const row of rows) {
        const values = headers.map(header => {
          const value = row[header] || '';
          // Truncate long values for readability
          const strValue = String(value);
          return strValue.length > 30 ? strValue.substring(0, 27) + '...' : strValue;
        });
        preview += values.join(' | ') + '\n';
      }

      preview += `\n(Showing ${rows.length} of ${parseResult.data.length} rows)\n`;

      log(`\n[DATAFRAME] ${label} - first 5 rows:${preview}`);
      console.log(`\n[DATAFRAME] ${label} - first 5 rows:${preview}`);
    } catch (error: any) {
      log(`  ⚠ Failed to preview ${label}: ${error.message}`, 'WARN');
    }
  }

  private async deleteGeneratedFiles(): Promise<void> {
    if (!this.fileId) {
      log('  ⚠ Cannot delete files: fileId not set', 'WARN');
      return;
    }

    if (!this.token) {
      log('  ⚠ Cannot delete files: missing auth token', 'WARN');
      return;
    }

    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    const targets: Array<{ source: 'datasets' | 'cleaned' | 'analysed'; label: string; path?: string }> = [
      { source: 'analysed', label: 'analysed file', path: this.analysedFilePath },
      { source: 'cleaned', label: 'cleaned file', path: this.cleanedFilePath },
      { source: 'datasets', label: 'dataset file', path: this.datasetFilePath },
    ];

    for (const target of targets) {
      try {
        await axios.delete(`${BASE_URL}/files/${this.fileId}`, {
          headers,
          params: target.source === 'datasets' ? {} : { source: target.source },
        });
        log(`✓ Deleted ${target.label} via API (source=${target.source})`);
      } catch (error: any) {
        log(
          `⚠ Failed to delete ${target.label} via API (source=${target.source}): ${error.message}`,
          'WARN'
        );
      }
    }

    this.datasetFilePath = '';
    this.cleanedFilePath = '';
    this.analysedFilePath = '';
  }

  async waitForCompletion(timeout: number = 300000): Promise<void> {
    log('\n=== Step 6: Waiting for Processing (5 minutes timeout) ===');
    const startTime = Date.now();
    const expectedEvents = [
      'added',
      'in_queue',
      'reading_dataset',
      'reading_dataset_done',
      'process_cleaning',
      'process_cleaning_done',
      'sending_to_llm',
      'sending_to_llm_progression',
      'sending_to_llm_done',
      'appending_collumns',
      'appending_collumns_done',
      'saving_file',
      'saving_file_done',
      'done',
    ];

    while (Date.now() - startTime < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if done event received
      const doneEvent = this.events.find((e) => e.event === 'done' && e.file_id === this.fileId);
      if (doneEvent) {
        log('\n✓ Processing completed!');
        break;
      }

      // Check for errors
      const errorEvent = this.events.find((e) => e.event === 'on_error' && e.file_id === this.fileId);
      if (errorEvent) {
        log('\n✗ Processing failed with error', 'ERROR');
        break;
      }
    }

    // Print summary
    log('\n=== Event Summary ===');
    const fileEvents = this.events.filter((e) => e.file_id === this.fileId);
    fileEvents.forEach((event) => {
      const extra = event.data && Object.keys(event.data).length ? ` | data=${JSON.stringify(event.data)}` : '';
      log(`  [${event.timestamp.toISOString()}] ${event.event}${extra}`);
    });

    const missingEvents = expectedEvents.filter(
      (evt) => !fileEvents.some((event) => event.event === evt)
    );
    if (missingEvents.length > 0) {
      log(`  ⚠ Missing events: ${missingEvents.join(', ')}`, 'WARN');
    } else {
      log('  ✓ All expected events received');
    }

    // Verify output files
    log('\n=== Verifying Output Files ===');
    
    // Try to get paths from event data first
    const cleaningDoneEvent = fileEvents.find((e) => e.event === 'process_cleaning_done');
    const savingDoneEvent = fileEvents.find((e) => e.event === 'saving_file_done');
    
    let cleanedPath = path.join(STORAGE_BASE, 'cleaned', `${this.fileId}.csv`);
    let analysedPath = path.join(STORAGE_BASE, 'analysed', `${this.fileId}.csv`);
    
    // Use path from event data if available (absolute path)
    if (cleaningDoneEvent?.data?.cleaned_path) {
      cleanedPath = cleaningDoneEvent.data.cleaned_path;
      log(`  Using cleaned_path from event: ${cleanedPath}`);
    }
    
    if (savingDoneEvent?.data?.analysed_path) {
      analysedPath = savingDoneEvent.data.analysed_path;
      log(`  Using analysed_path from event: ${analysedPath}`);
    }

    this.cleanedFilePath = cleanedPath;
    this.analysedFilePath = analysedPath;

    if (fs.existsSync(cleanedPath)) {
      log(`✓ Cleaned file exists: ${cleanedPath}`);
      await this.previewDataFrame('Cleaned dataset (cleaned)', cleanedPath);
    } else {
      log(`✗ Cleaned file missing: ${cleanedPath}`, 'ERROR');
      // Try alternative paths
      const altPaths = [
        path.join(STORAGE_BASE, 'cleaned', `${this.fileId}.csv`),
        path.join(path.dirname(STORAGE_BASE), 'storage', 'cleaned', `${this.fileId}.csv`),
      ];
      for (const altPath of altPaths) {
        if (fs.existsSync(altPath)) {
          log(`  ✓ Found at alternative path: ${altPath}`);
          this.cleanedFilePath = altPath;
          await this.previewDataFrame('Cleaned dataset (cleaned)', altPath);
          break;
        }
      }
    }

    if (fs.existsSync(analysedPath)) {
      log(`✓ Analysed file exists: ${analysedPath}`);
      // Check if file has sentiment, priority, topic columns
      const csvContent = fs.readFileSync(analysedPath, 'utf-8');
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',');
      if (headers.includes('sentiment') && headers.includes('priority') && headers.includes('main_topic')) {
        log('  ✓ File contains required columns: sentiment, priority, main_topic');
      } else {
        log('  ⚠ File missing required columns', 'WARN');
      }
      await this.previewDataFrame('Analysed dataset (analysed)', analysedPath);
    } else {
      log(`✗ Analysed file missing: ${analysedPath}`, 'ERROR');
      // Try alternative paths
      const altPaths = [
        path.join(STORAGE_BASE, 'analysed', `${this.fileId}.csv`),
        path.join(path.dirname(STORAGE_BASE), 'storage', 'analysed', `${this.fileId}.csv`),
      ];
      for (const altPath of altPaths) {
        if (fs.existsSync(altPath)) {
          log(`  ✓ Found at alternative path: ${altPath}`);
          this.analysedFilePath = altPath;
          await this.previewDataFrame('Analysed dataset (analysed)', altPath);
          break;
        }
      }
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.deleteGeneratedFiles();
      if (this.rabbitmqChannel) {
        await this.rabbitmqChannel.close();
        this.rabbitmqChannel = null;
      }
      if (this.rabbitmqConnection) {
        await (this.rabbitmqConnection as any).close();
        this.rabbitmqConnection = null;
      }
    } catch (error: any) {
      log(`Error during cleanup: ${error.message}`, 'ERROR');
    }
  }

  async run(): Promise<void> {
    try {
      log('='.repeat(60));
      log('Starting Workflow Test for Local Dataset Processing');
      log('='.repeat(60));

      // Setup RabbitMQ listener first
      await this.setupRabbitMQListener();

      // Wait a bit for RabbitMQ connection to stabilize
      log('Waiting 2 seconds for RabbitMQ connection to stabilize...');
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Run workflow steps
      await this.login();
      await this.updateSettings();
      await this.uploadFile();
      await this.createTask();
      await this.proceedTask();
      await this.waitForCompletion();

      log('\n' + '='.repeat(60));
      log('Workflow Test Completed');
      log('='.repeat(60));
    } catch (error: any) {
      log(`\n✗ Workflow test failed: ${error.message}`, 'ERROR');
      if (error.stack) {
        log(`Stack trace: ${error.stack}`, 'ERROR');
      }
      throw error;
    } finally {
      log('Cleaning up connections...');
      await this.cleanup();
      log('Cleanup completed');
    }
  }
}

// Main execution
async function main() {
  log('='.repeat(60));
  log('Starting Workflow Test');
  log('='.repeat(60));
  log('NOTE: Make sure the microservice is running (python main.py)');
  log('NOTE: Make sure RabbitMQ is running');
  log('NOTE: Make sure MongoDB is running');
  log(`Logs will be saved to: ${LOG_FILE}`);
  log('\nBooting backend server...\n');

  try {
    // Bootstrap the backend server (this starts the server asynchronously)
    // We don't await it because app.listen() is async but bootstrap returns immediately
    const bootstrapPromise = await bootstrap({
      dbConfigs: {
        type: 'mongodb',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '27017', 10),
        dbname: process.env.DB_NAME || 'dallosh_analysis',
        auth: process.env.DB_USER && process.env.DB_PASSWORD
          ? {
              username: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
            }
          : undefined,
      },
    });

    // Wait a bit for bootstrap to initialize database and start server
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Wait for server to be ready by checking health endpoint
    log('Waiting for server to be ready...');
    let serverReady = false;
    const maxAttempts = 60; // Increase timeout to 60 seconds
    let attempts = 0;

    while (!serverReady && attempts < maxAttempts) {
      try {
        log(`Health check attempt ${attempts + 1}/${maxAttempts}...`);
        const response = await axios.get(`http://localhost:5006/health`, { 
          timeout: 2000,
          validateStatus: () => true // Don't throw on any status
        });
        if (response.status === 200) {
          serverReady = true;
          log('✓ Server is ready!');
          break;
        } else {
          log(`Health check returned status ${response.status}`, 'WARN');
        }
      } catch (error: any) {
        // Server not ready yet, wait and retry
        attempts++;
        if (attempts % 5 === 0) {
          log(`  Waiting... (${attempts}/${maxAttempts})`, 'WARN');
        } else {
          log(`  Health check failed: ${error.message}`, 'WARN');
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!serverReady) {
      log('✗ Server failed to start within timeout', 'ERROR');
      log('  Check if port 5006 is already in use or if there are connection errors', 'ERROR');
      process.exit(1);
    }

    // Give server a moment to fully initialize routes
    log('Server ready, waiting 1 second for routes to initialize...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    log('Starting workflow test execution...');
    const test = new WorkflowTest();
    await test.run();
  } catch (error: any) {
    log(`✗ Failed to start workflow test: ${error.message}`, 'ERROR');
    if (error.stack) {
      log(`Stack trace: ${error.stack}`, 'ERROR');
    }
    process.exit(1);
  }
}

// Always run main when file is executed
main().catch((error: any) => {
  log(`Fatal error: ${error.message}`, 'ERROR');
  if (error.stack) {
    log(`Stack trace: ${error.stack}`, 'ERROR');
  }
  process.exit(1);
});

export default WorkflowTest;


