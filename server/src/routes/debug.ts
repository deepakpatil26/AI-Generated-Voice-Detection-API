import express, { Request, Response } from 'express';
import { VoiceDetectionService } from '../services/voiceDetectionService';
import { TestValidator } from '../services/testValidation';
import { logger } from '../utils/logger';

const router = express.Router();
const voiceService = new VoiceDetectionService();

// Debug endpoint to analyze audio features
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { audioBase64, language = 'English' } = req.body;

    // Decode and extract features
    const audioBuffer = voiceService.decodeBase64Audio(audioBase64);
    const features = await voiceService.extractAudioFeatures(audioBuffer);

    // Get detailed analysis
    const analysis = TestValidator.validateHeuristic(features);

    // Log the analysis
    logger.info('Audio analysis:', {
      features,
      analysis
    });

    res.json({
      status: 'success',
      features: {
        duration: features.duration,
        size: features.size,
        entropy: features.entropy,
        zeroCrossingRate: features.zeroCrossingRate
      },
      analysis: {
        classification: analysis.classification,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning
      },
      verification: TestValidator.getVerificationChecklist()
    });

  } catch (error) {
    logger.error('Debug analysis failed:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get verification checklist
router.get('/checklist', (req: Request, res: Response) => {
  res.json({
    checklist: TestValidator.getVerificationChecklist(),
    note: "This is a heuristic-based demo. For production, use real ML models."
  });
});

export default router;
