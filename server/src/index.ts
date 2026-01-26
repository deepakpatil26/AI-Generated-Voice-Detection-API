import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import voiceDetectionRoutes from './routes/voiceDetection';
import healthRoutes from './routes/health';
import debugRoutes from './routes/debug';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/voice', authMiddleware, voiceDetectionRoutes);
app.use('/api/debug', debugRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
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
app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
        error: 'Endpoint not found',
        code: 'NOT_FOUND'
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
