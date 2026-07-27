import express, { Request, Response } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { env } from './config/env';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(pinoHttp({ logger }));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Studio Backend API',
      version: '1.0.0',
      description: 'API for managing project files metadata',
    },
    servers: [
      {
        url: env.API_URL,
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/app.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/', routes);

// Error handling
app.use(errorHandler);

export default app;
