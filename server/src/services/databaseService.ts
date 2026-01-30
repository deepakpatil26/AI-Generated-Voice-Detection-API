import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import crypto from 'crypto';

interface ModelParameters {
  entropy_weight: number;
  zero_crossing_rate_weight: number;
  spectral_centroid_weight: number;
  spectral_rolloff_weight: number;
  duration_weight: number;
  mfcc_weights: number[];
}

export class DatabaseService {
  private supabase;
  private modelParametersCache: ModelParameters | null = null;
  private cacheTimestamp: number = 0;
  private cacheDurationMs: number = 300000; // 5 minutes

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      logger.warn('Supabase credentials not configured, using default model weights');
      this.supabase = null;
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async getActiveModelParameters(): Promise<ModelParameters> {
    // Return cached version if still valid
    if (this.modelParametersCache && Date.now() - this.cacheTimestamp < this.cacheDurationMs) {
      return this.modelParametersCache;
    }

    if (!this.supabase) {
      return this.getDefaultModelParameters();
    }

    try {
      const { data, error } = await this.supabase
        .from('model_parameters')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching model parameters:', error);
        return this.getDefaultModelParameters();
      }

      if (!data) {
        logger.warn('No active model parameters found, using defaults');
        return this.getDefaultModelParameters();
      }

      const parameters: ModelParameters = {
        entropy_weight: data.entropy_weight,
        zero_crossing_rate_weight: data.zero_crossing_rate_weight,
        spectral_centroid_weight: data.spectral_centroid_weight,
        spectral_rolloff_weight: data.spectral_rolloff_weight,
        duration_weight: data.duration_weight,
        mfcc_weights: data.mfcc_weights
      };

      this.modelParametersCache = parameters;
      this.cacheTimestamp = Date.now();

      return parameters;
    } catch (error) {
      logger.error('Error fetching model parameters:', error);
      return this.getDefaultModelParameters();
    }
  }

  async storeDetectionResult(
    audioBuffer: Buffer,
    language: string,
    classification: 'AI_GENERATED' | 'HUMAN',
    confidence: number,
    processingTimeMs: number,
    features: any,
    modelVersion: string = 'v1.0'
  ): Promise<void> {
    if (!this.supabase) {
      return;
    }

    try {
      // Calculate SHA256 hash of audio for deduplication
      const audioHash = crypto
        .createHash('sha256')
        .update(audioBuffer)
        .digest('hex');

      const { error } = await this.supabase
        .from('detection_history')
        .insert({
          audio_hash: audioHash,
          language,
          classification,
          confidence,
          processing_time_ms: processingTimeMs,
          model_version: modelVersion,
          features: features
        });

      if (error && !error.message.includes('duplicate')) {
        logger.error('Error storing detection result:', error);
      }
    } catch (error) {
      logger.error('Error storing detection result:', error);
    }
  }

  private getDefaultModelParameters(): ModelParameters {
    return {
      entropy_weight: 0.25,
      zero_crossing_rate_weight: 0.20,
      spectral_centroid_weight: 0.15,
      spectral_rolloff_weight: 0.15,
      duration_weight: 0.10,
      mfcc_weights: [0.05, 0.05, 0.05]
    };
  }
}
