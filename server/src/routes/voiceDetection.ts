import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { VoiceDetectionRequest, ErrorResponse } from '../types';
import { VoiceDetectionService } from '../services/voiceDetectionService';
import { logger } from '../utils/logger';

const router = Router();
const voiceDetectionService = new VoiceDetectionService();

// Validation schema
const voiceDetectionSchema = Joi.object({
  audioBase64: Joi.string().required().messages({
    'string.empty': 'Audio base64 is required',
    'any.required': 'Audio base64 is required'
  }),
  language: Joi.string()
    .custom((value, helpers) => {
      // Normalize language to proper case
      const normalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      const validLanguages = ['Tamil', 'English', 'Hindi', 'Malayalam', 'Telugu'];

      if (!validLanguages.includes(normalized)) {
        return helpers.error('any.invalid');
      }

      return normalized;
    })
    .required()
    .messages({
      'string.empty': 'language is required',
      'any.required': 'language is required',
      'any.invalid': 'language must be one of: Tamil, English, Hindi, Malayalam, Telugu'
    }),
  audioFormat: Joi.string().optional() // Allow audioFormat from hackathon tester
}).options({ stripUnknown: true });

router.post('/detect', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { error, value } = voiceDetectionSchema.validate(req.body);

    if (error) {
      const errorResponse: ErrorResponse = {
        status: 'error',
        message: error.details[0].message,
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(errorResponse);
    }

    const request: VoiceDetectionRequest = value;

    // Perform voice detection
    const result = await voiceDetectionService.detectVoice(request);

    res.json(result);

  } catch (error) {
    logger.error('Voice detection endpoint error:', error);

    const errorResponse: ErrorResponse = {
      status: 'error',
      message: 'Voice detection failed',
      code: 'DETECTION_ERROR',
      timestamp: new Date().toISOString()
    };

    res.status(500).json(errorResponse);
  }
});

export default router;
