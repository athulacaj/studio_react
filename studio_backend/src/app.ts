import express, { Request, Response } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yaml';
import fs from 'fs';
import path from 'path';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(pinoHttp({ logger }));

// Swagger setup
const swaggerFile = fs.readFileSync(path.join(__dirname, 'api', 'swagger.yaml'), 'utf8');
const swaggerDocument = yaml.parse(swaggerFile);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/', routes);

// Error handling
app.use(errorHandler);

export default app;
