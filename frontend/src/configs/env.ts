/**
 * Environment configuration for the frontend application
 */
export const env = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5006/api',
  API_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),

  // RabbitMQ Configuration
  // Web STOMP plugin runs on port 15674 (default)
  // Use ws:// for local development, wss:// for production
  // Credentials are optional - leave empty for anonymous connections if RabbitMQ allows it
  RABBITMQ_URL: process.env.NEXT_PUBLIC_RABBITMQ_URL || 'ws://localhost:15674/ws',
  RABBITMQ_USERNAME: process.env.NEXT_PUBLIC_RABBITMQ_USERNAME || '',
  RABBITMQ_PASSWORD: process.env.NEXT_PUBLIC_RABBITMQ_PASSWORD || '',
  RABBITMQ_TOPIC_TASKS: process.env.NEXT_PUBLIC_RABBITMQ_TOPIC_TASKS || 'tasks',

  // Application Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Dallosh Analysis',
} as const;

