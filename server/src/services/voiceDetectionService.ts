import { VoiceDetectionRequest, VoiceDetectionResponse, MLModelResponse } from '../types';
import { logger } from '../utils/logger';

export class VoiceDetectionService {
  async detectVoice(request: VoiceDetectionRequest): Promise<VoiceDetectionResponse> {
    const startTime = Date.now();

    try {
      // Validate base64 audio
      const audioBuffer = this.decodeBase64Audio(request.audioBase64);

      // Extract audio features (simplified for demo)
      const features = await this.extractAudioFeatures(audioBuffer);

      // Perform ML classification (using heuristic approach for demo)
      const mlResult = await this.classifyAudio(features);

      const processingTime = Date.now() - startTime;

      const response: VoiceDetectionResponse = {
        status: 'success',
        classification: mlResult.classification,
        confidence: mlResult.confidence,
        language: request.language || 'English',
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      };

      logger.info('Voice detection completed', {
        classification: mlResult.classification,
        confidence: mlResult.confidence,
        processingTime: processingTime
      });

      return response;

    } catch (error) {
      logger.error('Voice detection failed:', error);
      throw new Error('Voice detection failed');
    }
  }

  public decodeBase64Audio(base64String: string): Buffer {
    try {
      // Remove data URL prefix if present
      const cleanBase64 = base64String.replace(/^data:audio\/[a-z0-9]+;base64,/, '');

      // Validate base64 format
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
        throw new Error('Invalid base64 format');
      }

      // Decode base64
      const buffer = Buffer.from(cleanBase64, 'base64');

      // Validate buffer size
      const maxSizeBytes = (parseInt(process.env.MAX_FILE_SIZE_MB || '25')) * 1024 * 1024;
      const minSizeBytes = 1024; // 1KB minimum

      if (buffer.length === 0) {
        throw new Error('Audio data is empty');
      }

      if (buffer.length < minSizeBytes) {
        throw new Error('Audio file is too small (minimum 1KB)');
      }

      if (buffer.length > maxSizeBytes) {
        throw new Error(`Audio file is too large (maximum ${process.env.MAX_FILE_SIZE_MB || 25}MB)`);
      }

      // Basic MP3 validation - check for MP3 header
      const hasMP3Header = buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0;
      const hasID3Header = buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33;

      if (!hasMP3Header && !hasID3Header) {
        logger.warn('Audio file may not be a valid MP3 format');
      }

      return buffer;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Invalid audio data: ${error.message}`);
      }
      throw new Error('Invalid base64 audio data');
    }
  }

  // Make this method accessible for debugging
  public async extractAudioFeatures(audioBuffer: Buffer): Promise<any> {
    // Simplified feature extraction
    // In a real implementation, you would use audio processing libraries
    // like node-wav, audio-buffer-utils, or call a Python service

    const features = {
      duration: audioBuffer.length / 44100, // Approximate duration
      size: audioBuffer.length,
      entropy: this.calculateEntropy(audioBuffer),
      zeroCrossingRate: this.calculateZeroCrossingRate(audioBuffer)
    };

    return features;
  }

  private calculateEntropy(buffer: Buffer): number {
    // Simple entropy calculation
    const frequency = new Array(256).fill(0);
    for (let i = 0; i < buffer.length; i++) {
      frequency[buffer[i]]++;
    }

    let entropy = 0;
    for (let i = 0; i < 256; i++) {
      if (frequency[i] > 0) {
        const probability = frequency[i] / buffer.length;
        entropy -= probability * Math.log2(probability);
      }
    }

    return entropy;
  }

  private calculateZeroCrossingRate(buffer: Buffer): number {
    let crossings = 0;
    for (let i = 1; i < buffer.length; i++) {
      if ((buffer[i] >= 128) !== (buffer[i - 1] >= 128)) {
        crossings++;
      }
    }
    return crossings / buffer.length;
  }

  private async classifyAudio(features: any): Promise<MLModelResponse> {
    // Simplified heuristic-based classification
    // In a real implementation, you would use TensorFlow.js, call an external ML API,
    // or integrate with a Python ML service

    let aiScore = 0.5; // Default to uncertain

    // Heuristic: AI voices often have different characteristics
    if (features.entropy > 7.5) aiScore += 0.2;
    if (features.zeroCrossingRate < 0.05) aiScore += 0.1;
    if (features.duration > 5) aiScore += 0.1;

    // Remove randomness for consistent testing
    // aiScore += (Math.random() - 0.5) * 0.2;

    aiScore = Math.max(0, Math.min(1, aiScore));

    const classification = aiScore > 0.5 ? 'AI_GENERATED' : 'HUMAN';
    const confidence = Math.abs(aiScore - 0.5) * 2;

    return {
      classification,
      confidence
    };
  }
}
