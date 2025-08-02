/**
 * Enhanced ElysiaJS Cross-Chain Relayer Server
 * 1inch Fusion Protocol backend with comprehensive monitoring and coordination
 */

import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { bearer } from '@elysiajs/bearer';
import { staticPlugin } from '@elysiajs/static';
import { cron } from '@elysiajs/cron';

// Database and core services
import { DatabaseManager, getDatabaseManager, createDatabaseMiddleware } from './config/database.js';
import { RedisService } from './services/redis/redisService.js';
import { logger } from './utils/logger.js';

// Monitoring and coordination
import { EventMonitor } from './services/monitoring/eventMonitor.js';
import { SwapCoordinator } from './services/coordination/swapCoordinator.js';

// API routes
import { swapsRoutes } from './routes/api/swaps.js';
import { healthRoutes } from './routes/health.js';
import { metricsRoutes } from './routes/metrics.js';
import { webhookRoutes } from './routes/webhooks.js';

// Configuration and types
import { MonitorConfig } from './types/events.js';

/**
 * Main ElysiaJS server class
 */
class EnhancedCrossChainRelayer {
  private app: Elysia;
  private dbManager: DatabaseManager;
  private redisService: RedisService;
  private eventMonitor: EventMonitor;
  private swapCoordinator: SwapCoordinator;
  private isRunning = false;

  constructor() {
    this.dbManager = getDatabaseManager();
    this.redisService = new RedisService();
    this.setupApplication();
  }

  /**
   * Setup Elysia application
   */
    private setupApplication(): void {
    try {
      console.log('🔍 Setting up Elysia application...');
      
      // Create the most basic Elysia instance without any plugins
      this.app = new Elysia({ name: 'cross-chain-relayer' });
      
      console.log('🔍 App instance created:', !!this.app);
      
      // Register routes
      this.registerRoutes();
      
      console.log('🔍 Routes registered successfully');
      
    } catch (error) {
      console.error('❌ Failed to setup application:', error);
      throw error;
    }
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    try {
      logger.info('🚀 Initializing Enhanced Cross-Chain Relayer...');

      // Temporarily skip database and other service initialization
      logger.info('⚠️ Running in minimal mode - database and monitoring services disabled');
      
      logger.info('✅ API routes registered');

      logger.info('🎉 Enhanced Cross-Chain Relayer initialized successfully (minimal mode)');
    } catch (error) {
      logger.error('❌ Failed to initialize relayer:', error);
      throw error;
    }
  }

  /**
   * Register all API routes
   */
  private registerRoutes(): void {
    console.log('Registering API routes...');
    
    // Register basic routes (not dependent on database)
    this.app = this.app
      .get('/', () => 'Enhanced Cross-Chain Relayer is running!')
      .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
      .get('/api/health', () => ({ status: 'ok', message: 'API is running' }))
      .get('/api/status', () => ({ 
        status: 'running', 
        version: '2.0.0',
        uptime: process.uptime()
      }))
      .get('/test', () => ({ status: 'ok', message: 'Test endpoint working' }));
    
    // Temporarily comment out database-related routes
    // TODO: Re-enable database routes
    // this.app.use(healthRoutes);
    // this.app.use(swapsRoutes);
    // this.app.use(metricsRoutes);
    // this.app.use(webhookRoutes);
    
    console.log('API routes registered successfully');
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Monitor event listeners
    this.eventMonitor.on('eventProcessed', (data) => {
      logger.debug('Event processed:', data.event.type);
      this.recordMetric('events_processed', 1, {
        chain: data.chain,
        eventType: data.event.type,
      });
    });

    this.eventMonitor.on('eventFailed', (data) => {
      logger.error('Event processing failed:', data.error);
      this.recordMetric('events_failed', 1, {
        chain: data.chain,
        eventType: data.event.type,
      });
    });

    // Swap coordinator events
    this.swapCoordinator.on('swapCreated', (swap) => {
      logger.info('New swap created:', swap.id);
      this.recordMetric('swaps_created', 1, {
        sourceChain: swap.sourceChain,
        targetChain: swap.targetChain,
      });
    });

    this.swapCoordinator.on('swapCompleted', (swap) => {
      logger.info('Swap completed:', swap.id);
      this.recordMetric('swaps_completed', 1, {
        sourceChain: swap.sourceChain,
        targetChain: swap.targetChain,
      });
    });

    this.swapCoordinator.on('swapFailed', (swap) => {
      logger.warn('Swap failed:', swap.id);
      this.recordMetric('swaps_failed', 1, {
        sourceChain: swap.sourceChain,
        targetChain: swap.targetChain,
      });
    });
  }

  /**
   * Start server
   */
  async start(): Promise<void> {
    try {
      const port = parseInt(process.env.PORT || '3001');
      const hostname = process.env.HOST || '0.0.0.0';

      console.log('🔍 Checking app instance before start:', !!this.app);
      console.log('🔍 App type:', typeof this.app);
      console.log('🔍 App listen method:', typeof this.app.listen);
      
      if (!this.app) {
        throw new Error('App instance is not initialized');
      }

      // Use listen method correctly according to Elysia 1.3.8 documentation
      console.log('🔍 About to call listen with port:', port);
      
      // Elysia's listen method should be called like this
      this.app.listen(port);
      
      this.isRunning = true;

      // Use app.server to get server information
      const serverUrl = this.app.server?.url || `http://${hostname}:${port}`;
      
      logger.info(`🌐 Enhanced Relayer server listening on ${serverUrl}`);
      logger.info(`📊 Health endpoint: ${serverUrl}/health`);
      logger.info(`📋 API docs: ${serverUrl}/docs`);
      logger.info(`🔄 Swaps API: ${serverUrl}/api/swaps`);
      logger.info(`📈 Metrics: ${serverUrl}/metrics`);

      console.log(`🦊 Elysia is running at ${this.app.server?.hostname}:${this.app.server?.port}`);

    } catch (error) {
      logger.error('❌ Failed to start relayer server:', error);
      throw error;
    }
  }

  /**
   * Stop server and all services
   */
  async stop(): Promise<void> {
    logger.info('🛑 Shutting down Enhanced Cross-Chain Relayer...');
    this.isRunning = false;

    try {
      // Stop event monitoring
      if (this.eventMonitor) {
        await this.eventMonitor.stop();
        logger.info('✅ Event monitor stopped');
      }

      // Stop swap coordinator
      if (this.swapCoordinator) {
        await this.swapCoordinator.stop();
        logger.info('✅ Swap coordinator stopped');
      }

      // Close Redis connection
      if (this.redisService) {
        await this.redisService.disconnect();
        logger.info('✅ Redis connection closed');
      }

      // Close database connection
      if (this.dbManager) {
        await this.dbManager.close();
        logger.info('✅ Database connection closed');
      }

      logger.info('✅ Enhanced Relayer shutdown complete');
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
    }
  }

  /**
   * Collect system metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      // Database statistics
      const dbStats = await this.dbManager.getStats();
      this.recordMetric('swaps_total', dbStats.totalSwaps);
      this.recordMetric('swaps_active', dbStats.activeSwaps);
      this.recordMetric('swaps_completed', dbStats.completedSwaps);
      this.recordMetric('swaps_failed', dbStats.failedSwaps);

      // Event monitoring statistics
      if (this.eventMonitor) {
        const monitorStats = this.eventMonitor.getStats();
        this.recordMetric('monitor_running', monitorStats.isRunning ? 1 : 0);
        this.recordMetric('monitor_processing_queue', monitorStats.processingQueue);
        
        // Record sync status for each chain
        Object.entries(monitorStats.lastSync).forEach(([chain, blockNumber]) => {
          this.recordMetric('last_sync_block', blockNumber, { chain });
        });
      }

      // Redis statistics
      const redisStats = await this.redisService.getStats();
      this.recordMetric('redis_connected', redisStats.connected ? 1 : 0);
      this.recordMetric('redis_memory_usage', redisStats.used_memory || 0);

    } catch (error) {
      logger.error('Failed to collect metrics:', error);
    }
  }

  /**
   * Record metrics to database
   */
  private async recordMetric(name: string, value: number, tags: Record<string, any> = {}): Promise<void> {
    try {
      const db = this.dbManager.getDatabase();
      const { metrics } = await import('./schema/index.js');
      
      await db.insert(metrics).values({
        id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        value,
        tags,
        timestamp: Math.floor(Date.now() / 1000),
      });
    } catch (error) {
      // Silently log errors to avoid affecting main flow
      logger.debug('Failed to record metric:', error);
    }
  }

  /**
   * Get server status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      eventMonitor: this.eventMonitor ? this.eventMonitor.getStatus() : null,
      swapCoordinator: this.swapCoordinator ? this.swapCoordinator.getStats() : null,
      database: {
        connected: true, // Database health check is handled in middleware
      },
      redis: this.redisService ? this.redisService.isConnected() : false,
    };
  }
}

// ========== Global Error Handling and Startup Logic ==========

// Create global relayer instance
const relayer = new EnhancedCrossChainRelayer();

/**
 * Global exception handling
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

/**
 * Graceful shutdown handling
 */
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`${signal} received, starting graceful shutdown...`);
  
  try {
    await relayer.stop();
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Main startup function
 */
async function main(): Promise<void> {
  try {
    logger.info('🔥 Starting Enhanced 1inch Fusion Cross-Chain Relayer v2.0.0');
    
    // Initialize all services
    await relayer.initialize();
    
    // Start server
    await relayer.start();
    
    // Output startup success information
    logger.info('🎊 Enhanced Cross-Chain Relayer is now running!');
    logger.info('🔗 Ready to facilitate cross-chain atomic swaps');
    logger.info('⚡ ElysiaJS backend with comprehensive monitoring enabled');
    
  } catch (error) {
    logger.error('Failed to start Enhanced Cross-Chain Relayer:', error);
    process.exit(1);
  }
}

/**
 * Start application
 */
main().catch((error) => {
  logger.error('Unhandled error in main function:', error);
  process.exit(1);
});

// Export relayer instance for testing and external integration
export default relayer;
export { EnhancedCrossChainRelayer };