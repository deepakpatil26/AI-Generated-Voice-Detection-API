import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.API_KEY;

  if (!apiKey) {
    const error: ErrorResponse = {
      status: 'error',
      message: 'API key is required',
      code: 'API_KEY_MISSING',
      timestamp: new Date().toISOString()
    };
    return res.status(401).json(error);
  }

  if (apiKey !== validApiKey) {
    const error: ErrorResponse = {
      status: 'error',
      message: 'Invalid API key',
      code: 'API_KEY_INVALID',
      timestamp: new Date().toISOString()
    };
    return res.status(401).json(error);
  }

  next();
};
