import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { logger } from '../src/utils/logger';
import { errorHandler } from '../src/middleware/errorHandler';
import healthRoutes from '../src/routes/health';

// Load test environment variables
dotenv.config();

// Create test app instance
const createTestApp = () => {
  const app = express();
  
  // Middleware
  app.use(helmet());
  app.use(compression());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
      status: 'error',
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP'
    }
  });
  app.use(limiter);
  
  // Routes
  app.use('/api/health', healthRoutes);
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'AI Voice Detection API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        detect: '/api/voice/detect',
        debug: '/api/debug/analyze',
        checklist: '/api/debug/checklist'
      },
      supportedLanguages: ['Tamil', 'English', 'Hindi', 'Malayalam', 'Telugu']
    });
  });
  
  // Error handling
  app.use(errorHandler);
  
  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      status: 'error',
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      timestamp: new Date().toISOString()
    });
  });
  
  return app;
};

describe('Health Check API', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version', '1.0.0');
    });

    it('should return server information', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('memory');
      expect(response.body.memory).toHaveProperty('used');
      expect(response.body.memory).toHaveProperty('total');
    });
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'AI Voice Detection API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body).toHaveProperty('supportedLanguages');
      
      expect(response.body.supportedLanguages).toEqual([
        'Tamil', 'English', 'Hindi', 'Malayalam', 'Telugu'
      ]);
    });
  });
});
