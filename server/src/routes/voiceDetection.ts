import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { VoiceDetectionRequest, ErrorResponse, VoiceDetectionResponse } from '../types';
import { AdvancedVoiceDetectionService } from '../services/advancedVoiceDetectionService';
import { DatabaseService } from '../services/databaseService';
import { logger } from '../utils/logger';

const router = Router();
const advancedVoiceDetectionService = new AdvancedVoiceDetectionService();
const databaseService = new DatabaseService();

const voiceDetectionSchema = Joi.object({
  audioBase64: Joi.string().required().messages({
    'string.empty': 'Audio base64 is required',
    'any.required': 'Audio base64 is required'
  }),
  language: Joi.string()
    .custom((value, helpers) => {
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
  audioFormat: Joi.string().optional()
}).options({ stripUnknown: true });

function decodeBase64Audio(base64String: string): Buffer {
  try {
    const cleanBase64 = base64String
      .replace(/^data:audio\/[a-z0-9]+;base64,/, '')
      .replace(/\s/g, '');

    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
      throw new Error('Invalid base64 format');
    }

    const buffer = Buffer.from(cleanBase64, 'base64');

    const maxSizeBytes = (parseInt(process.env.MAX_FILE_SIZE_MB || '25')) * 1024 * 1024;
    const minSizeBytes = 1024;

    if (buffer.length === 0) {
      throw new Error('Audio data is empty');
    }

    if (buffer.length < minSizeBytes) {
      throw new Error('Audio file is too small (minimum 1KB)');
    }

    if (buffer.length > maxSizeBytes) {
      throw new Error(`Audio file is too large (maximum ${process.env.MAX_FILE_SIZE_MB || 25}MB)`);
    }

    const hasMP3Header = buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0;
    const hasID3Header = buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33;

    if (!hasMP3Header && !hasID3Header) {
      logger.warn('Audio file may not be a valid MP3 format');
    }

    return buffer;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown decoding error';
    logger.error(`Audio decoding failed: ${errorMessage}`);

    if (errorMessage.includes('Invalid base64')) {
      throw new Error(`Invalid base64 format: ${errorMessage}`);
    }

    throw new Error(`Failed to process audio data: ${errorMessage}`);
  }
}

router.post('/detect', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();

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

    const audioBuffer = decodeBase64Audio(request.audioBase64);

    const features = await advancedVoiceDetectionService.extractAdvancedFeatures(audioBuffer);
    const classificationDetails = await advancedVoiceDetectionService.classifyAudioAdvanced(features);

    const processingTimeMs = Date.now() - startTime;

    const response: VoiceDetectionResponse = {
      status: 'success',
      classification: classificationDetails.classification,
      confidence: classificationDetails.confidence,
      language: request.language || 'English',
      processingTimeMs,
      timestamp: new Date().toISOString(),
      explainability: {
        reasoning: classificationDetails.reasoning,
        featuresAnalyzed: classificationDetails.featuresAnalyzed,
        confidenceBreakdown: {
          weightedScore: classificationDetails.weightedScore,
          patternScore: classificationDetails.patternScore,
          statisticalScore: classificationDetails.statisticalScore
        }
      }
    };

    try {
      await databaseService.storeDetectionResult(
        audioBuffer,
        request.language || 'English',
        classificationDetails.classification,
        classificationDetails.confidence,
        processingTimeMs,
        classificationDetails.features,
        'v1.0'
      );
    } catch (dbError) {
      logger.warn('Failed to store detection result:', dbError);
    }

    logger.info('Voice detection completed', {
      classification: classificationDetails.classification,
      confidence: classificationDetails.confidence,
      processingTime: processingTimeMs
    });

    res.json(response);

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
