import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { logger } from '../src/utils/logger';
import { errorHandler } from '../src/middleware/errorHandler';
import { authMiddleware } from '../src/middleware/auth';
import voiceDetectionRoutes from '../src/routes/voiceDetection';
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
  
  // Request logging (disabled for tests)
  app.use((req, res, next) => {
    next();
  });
  
  // Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/voice', authMiddleware, voiceDetectionRoutes);
  
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

describe('Voice Detection API', () => {
  const validApiKey = 'your-secret-api-key-change-in-production';
  const invalidApiKey = 'invalid-api-key';
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/voice/detect', () => {
    it('should require API key authentication', async () => {
      const response = await request(app)
        .post('/api/voice/detect')
        .send({
          audioBase64: 'dGVzdCBhdWRpbyBkYXRh',
          language: 'English'
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('code', 'API_KEY_MISSING');
      expect(response.body).toHaveProperty('message');
    });

    it('should reject requests without audio data', async () => {
      const response = await request(app)
        .post('/api/voice/detect')
        .set('X-API-Key', validApiKey)
        .send({
          language: 'English'
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.message).toContain('Audio base64 is required');
    });

    it('should reject requests without language', async () => {
      const response = await request(app)
        .post('/api/voice/detect')
        .set('X-API-Key', validApiKey)
        .send({
          audioBase64: 'dGVzdCBhdWRpbyBkYXRh'
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.message).toContain('language is required');
    });

    it('should reject unsupported languages', async () => {
      const response = await request(app)
        .post('/api/voice/detect')
        .set('X-API-Key', validApiKey)
        .send({
          audioBase64: 'dGVzdCBhdWRpbyBkYXRh',
          language: 'Spanish'
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should accept valid requests and return detection results', async () => {
      const response = await request(app)
        .post('/api/voice/detect')
        .set('X-API-Key', validApiKey)
        .send({
          audioBase64: 'dGVzdCBhdWRpbyBkYXRh',
          language: 'English'
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('classification');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('language', 'English');
      expect(response.body).toHaveProperty('processingTimeMs');
      expect(response.body).toHaveProperty('timestamp');

      expect(['AI_GENERATED', 'HUMAN']).toContain(response.body.classification);
      expect(response.body.confidence).toBeGreaterThanOrEqual(0);
      expect(response.body.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle all supported languages', async () => {
      const languages = ['Tamil', 'English', 'Hindi', 'Malayalam', 'Telugu'];
      
      for (const language of languages) {
        const response = await request(app)
          .post('/api/voice/detect')
          .set('X-API-Key', validApiKey)
          .send({
            audioBase64: 'dGVzdCBhdWRpbyBkYXRh',
            language
          })
          .expect(200);

        expect(response.body).toHaveProperty('language', language);
      }
    });

    it('should handle invalid base64 data gracefully', async () => {
      const response = await request(app)
        .post('/api/voice/detect')
        .set('X-API-Key', validApiKey)
        .send({
          audioBase64: 'invalid-base64-data!@#',
          language: 'English'
        })
        .expect(200);

      // The API should handle invalid base64 gracefully and still return a result
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('classification');
    });
  });
});
