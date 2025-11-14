import { DatabaseConfig, DatabaseService } from '@lib/database';
import { createApp } from '@core/server';
import { createApiRoutes } from '@api';
import { initializeCollections, initializeRoot } from '@scripts';
import { env } from '@configs/env';
import { BootstrapConfig } from './types/configs';

const bootstrap = async (configs: BootstrapConfig): Promise<void> => {
  try {
    console.log('Starting Dallosh Analysis Backend...');

    // Build database configuration
    const dbConfigs = configs.dbConfigs as DatabaseConfig || {
      type: env.DB_TYPE as 'mongodb',
      host: env.DB_HOST,
      port: env.DB_PORT,
      dbname: env.DB_NAME,
      auth: env.DB_USER && env.DB_PASSWORD
        ? {
            username: env.DB_USER,
            password: env.DB_PASSWORD,
          }
        : undefined,
    };

    // Parse MONGODB_URI if provided (for backward compatibility)
    if (env.MONGODB_URI && !env.DB_HOST) {
      try {
        const uri = new URL(env.MONGODB_URI);
        dbConfigs.host = uri.hostname;
        dbConfigs.port = parseInt(uri.port || '27017', 10);
        dbConfigs.dbname = uri.pathname.slice(1) || env.DB_NAME;
        
        if (uri.username && uri.password) {
          dbConfigs.auth = {
            username: decodeURIComponent(uri.username),
            password: decodeURIComponent(uri.password),
          };
        }
      } catch (error) {
        console.warn('Failed to parse MONGODB_URI, using default config');
      }
    }

    console.log(`Database config: ${dbConfigs.type}://${dbConfigs.host}:${dbConfigs.port}/${dbConfigs.dbname}`);
    console.log(`Auth configured: ${dbConfigs.auth ? `yes (user: ${dbConfigs.auth.username})` : 'no'}`);

    // Initialize database service with config
    databaseServiceInstance = new DatabaseService(dbConfigs);
    
    // Connect to database
    await databaseServiceInstance.connect();
    const db = databaseServiceInstance.getAdapter();

    // Initialize collections and default data
    await initializeCollections(db);
    await initializeRoot(db);

    // Create Express app
    const app = createApp(db);

    // Register API routes
    app.use('/api', createApiRoutes(db));

    // Error handling middleware
    app.use((err: any, _req: any, res: any, _next: any) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: env.NODE_ENV === 'development' ? err.message : undefined,
      });
    });

    // Start server
    const port = env.PORT;
    const host = env.HOST;
    app.listen(port, host, () => {
      console.log(`✓ Server running on port ${port}`);
      console.log(`✓ Environment: ${env.NODE_ENV}`);
      console.log(`✓ Health check: http://${host}:${port}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Store database service instance for graceful shutdown
let databaseServiceInstance: DatabaseService | null = null;

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (databaseServiceInstance) {
    await databaseServiceInstance.disconnect();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  if (databaseServiceInstance) {
    await databaseServiceInstance.disconnect();
  }
  process.exit(0);
});

export default bootstrap;
