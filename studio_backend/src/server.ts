import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './prisma/client';

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to database');

    const server = app.listen(config.PORT, () => {
      logger.info(`Server is running on port ${config.PORT} in ${config.NODE_ENV} mode`);
    });

    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close();
      await prisma.$disconnect();
      process.exit(0);
    });

  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
