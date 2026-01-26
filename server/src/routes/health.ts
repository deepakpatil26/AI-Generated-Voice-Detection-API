import { Router, Request, Response } from 'express';
import { HealthResponse } from '../types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  const response: HealthResponse = {
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
    }
  };

  res.json(response);
});

export default router;
