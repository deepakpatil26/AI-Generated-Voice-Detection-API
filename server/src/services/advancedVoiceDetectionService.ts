import { AudioFeatures, MLModelResponse } from '../types';
import { logger } from '../utils/logger';
import { DatabaseService } from './databaseService';

interface ModelWeights {
  entropy: number;
  zeroCrossingRate: number;
  spectralCentroid: number;
  spectralRolloff: number;
  duration: number;
  mfcc: number[];
}

interface ClassificationDetails {
  classification: 'AI_GENERATED' | 'HUMAN';
  confidence: number;
  weightedScore: number;
  patternScore: number;
  statisticalScore: number;
  features: AudioFeatures;
  reasoning: string[];
  featuresAnalyzed: string[];
}

export class AdvancedVoiceDetectionService {
  private modelWeights: ModelWeights;
  private databaseService: DatabaseService;

  constructor() {
    this.databaseService = new DatabaseService();
    this.modelWeights = {
      entropy: 0.25,
      zeroCrossingRate: 0.20,
      spectralCentroid: 0.15,
      spectralRolloff: 0.15,
      duration: 0.10,
      mfcc: [0.05, 0.05, 0.05]
    };
  }

  async loadModelWeights(): Promise<void> {
    try {
      const params = await this.databaseService.getActiveModelParameters();
      this.modelWeights = {
        entropy: params.entropy_weight,
        zeroCrossingRate: params.zero_crossing_rate_weight,
        spectralCentroid: params.spectral_centroid_weight,
        spectralRolloff: params.spectral_rolloff_weight,
        duration: params.duration_weight,
        mfcc: params.mfcc_weights
      };
      logger.info('Loaded model weights from database');
    } catch (error) {
      logger.warn('Using default model weights:', error);
    }
  }

  async extractAdvancedFeatures(audioBuffer: Buffer): Promise<AudioFeatures> {
    try {
      logger.info('Extracting advanced audio features...');

      const audioData = this.bufferToAudioData(audioBuffer);

      const basicFeatures = this.extractBasicFeatures(audioData);
      const spectralFeatures = this.extractSpectralFeatures(audioData);
      const mfccFeatures = this.extractMFCCFeatures(audioData);
      const entropy = this.calculateEntropy(audioBuffer);

      const features: AudioFeatures = {
        ...basicFeatures,
        ...spectralFeatures,
        ...mfccFeatures,
        entropyMean: entropy,
        entropyStd: this.calculateEntropyStd(audioBuffer),
        zcrMean: basicFeatures.zeroCrossingRate || this.calculateZeroCrossingRate(audioBuffer),
        zcrStd: 0.01
      };

      logger.info('Advanced features extracted successfully');
      return features;
    } catch (error) {
      logger.error('Error extracting advanced features:', error);
      throw new Error('Failed to extract advanced audio features');
    }
  }

  async classifyAudioAdvanced(features: AudioFeatures): Promise<ClassificationDetails> {
    try {
      await this.loadModelWeights();
      logger.info('Starting advanced audio classification...');

      const weightedScore = this.calculateWeightedScore(features);
      const patternScore = this.calculatePatternScore(features);
      const statisticalScore = this.calculateStatisticalScore(features);

      const ensembleScore = this.ensembleResults([
        weightedScore,
        patternScore,
        statisticalScore
      ]);

      const calibratedScore = this.calibrateConfidence(ensembleScore);

      const classification = calibratedScore > 0.5 ? 'AI_GENERATED' : 'HUMAN';
      const confidence = Math.abs(calibratedScore - 0.5) * 2;

      const reasoning = this.generateReasoning(features, classification, calibratedScore);
      const featuresAnalyzed = this.getFeaturesAnalyzedList(features);

      logger.info(`Classification: ${classification}, Confidence: ${confidence.toFixed(3)}`);

      return {
        classification,
        confidence,
        weightedScore,
        patternScore,
        statisticalScore,
        features,
        reasoning,
        featuresAnalyzed
      };
    } catch (error) {
      logger.error('Error in advanced classification:', error);
      throw new Error('Failed to classify audio using advanced model');
    }
  }

  private calculateWeightedScore(features: AudioFeatures): number {
    let score = 0.5;

    if (features.entropyMean > 7.0) {
      score += this.modelWeights.entropy * 0.3;
    } else {
      score -= this.modelWeights.entropy * 0.2;
    }

    if (features.zcrMean < 0.05) {
      score += this.modelWeights.zeroCrossingRate * 0.4;
    } else {
      score -= this.modelWeights.zeroCrossingRate * 0.3;
    }

    if (features.spectralCentroidMean > 0.6) {
      score += this.modelWeights.spectralCentroid * 0.3;
    } else {
      score -= this.modelWeights.spectralCentroid * 0.2;
    }

    const duration = features.duration || 0;
    if (duration > 10 || duration < 1) {
      score += this.modelWeights.duration * 0.2;
    }

    const mfccComplexity = this.calculateMFCCComplexity(features);
    score += mfccComplexity * 0.15;

    return Math.max(0, Math.min(1, score));
  }

  private calculatePatternScore(features: AudioFeatures): number {
    let score = 0.5;

    const spectralVariance = features.spectralCentroidStd;
    if (spectralVariance < 0.1) {
      score += 0.2;
    }

    const consistencyScore = this.calculateConsistencyScore(features);
    score += consistencyScore * 0.3;

    const regularityScore = this.calculateRegularityScore(features);
    if (regularityScore > 0.7) {
      score += 0.25;
    }

    return Math.max(0, Math.min(1, score));
  }

  private calculateStatisticalScore(features: AudioFeatures): number {
    let score = 0.5;

    const entropySkewness = this.calculateSkewness(features.entropyMean, features.entropyStd);
    if (Math.abs(entropySkewness) < 0.5) {
      score += 0.15;
    }

    const correlationScore = this.calculateFeatureCorrelation(features);
    score += correlationScore * 0.2;

    const outlierScore = this.detectOutliers(features);
    if (outlierScore < 0.3) {
      score += 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  private ensembleResults(scores: number[]): number {
    const weights = [0.4, 0.35, 0.25];
    const weightedSum = scores.reduce((sum, score, index) => sum + score * weights[index], 0);
    return weightedSum / weights.reduce((sum, weight) => sum + weight, 0);
  }

  private calibrateConfidence(score: number): number {
    const calibrated = 1 / (1 + Math.exp(-10 * (score - 0.5)));
    return calibrated;
  }

  private bufferToAudioData(buffer: Buffer): number[] {
    const samples: number[] = [];
    for (let i = 0; i < buffer.length; i += 2) {
      if (i + 1 < buffer.length) {
        const sample = buffer.readInt16LE(i) / 32768.0;
        samples.push(sample);
      }
    }
    return samples;
  }

  private extractBasicFeatures(audioData: number[]): any {
    const mean = audioData.reduce((sum, val) => sum + val, 0) / audioData.length;
    const variance = audioData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / audioData.length;
    const std = Math.sqrt(variance);

    return {
      rmsMean: Math.sqrt(variance),
      rmsStd: std,
      duration: audioData.length / 44100,
      zeroCrossingRate: this.calculateZeroCrossingRateFromData(audioData)
    };
  }

  private extractSpectralFeatures(audioData: number[]): any {
    const fft = this.simpleFFT(audioData);
    const magnitudes = fft.map(complex => Math.sqrt(complex.real * complex.real + complex.imag * complex.imag));

    const spectralCentroid = this.calculateSpectralCentroid(magnitudes);
    const spectralRolloff = this.calculateSpectralRolloff(magnitudes);
    const spectralBandwidth = this.calculateSpectralBandwidth(magnitudes, spectralCentroid);

    return {
      spectralCentroidMean: spectralCentroid,
      spectralCentroidStd: 0.1,
      spectralRolloffMean: spectralRolloff,
      spectralRolloffStd: 0.1,
      spectralBandwidthMean: spectralBandwidth,
      spectralBandwidthStd: 0.1
    };
  }

  private extractMFCCFeatures(audioData: number[]): any {
    const mfccCoefficients = this.calculateMFCC(audioData);

    return {
      mfccMean: mfccCoefficients.slice(0, 13),
      mfccStd: new Array(13).fill(0.1)
    };
  }

  private calculateMFCC(audioData: number[]): number[] {
    const coefficients: number[] = [];
    const frameSize = Math.min(512, audioData.length);

    for (let i = 0; i < 13; i++) {
      let sum = 0;
      for (let j = 0; j < Math.min(frameSize, audioData.length); j++) {
        const freq = (i + 1) * Math.PI * j / frameSize;
        sum += audioData[j] * Math.cos(freq);
      }
      coefficients.push(Math.abs(sum) / frameSize);
    }

    return coefficients;
  }

  private simpleFFT(data: number[]): Array<{ real: number; imag: number }> {
    const N = Math.min(data.length, 256);
    const result: Array<{ real: number; imag: number }> = [];

    for (let k = 0; k < N; k++) {
      let real = 0;
      let imag = 0;

      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        real += data[n] * Math.cos(angle);
        imag += data[n] * Math.sin(angle);
      }

      result.push({ real, imag });
    }

    return result;
  }

  private calculateSpectralCentroid(magnitudes: number[]): number {
    const weightedSum = magnitudes.reduce((sum, mag, index) => sum + mag * index, 0);
    const totalMagnitude = magnitudes.reduce((sum, mag) => sum + mag, 0);
    return totalMagnitude > 0 ? weightedSum / totalMagnitude / magnitudes.length : 0;
  }

  private calculateSpectralRolloff(magnitudes: number[]): number {
    const totalMagnitude = magnitudes.reduce((sum, mag) => sum + mag, 0);
    const threshold = 0.85 * totalMagnitude;
    let cumulative = 0;

    for (let i = 0; i < magnitudes.length; i++) {
      cumulative += magnitudes[i];
      if (cumulative >= threshold) {
        return i / magnitudes.length;
      }
    }

    return 1.0;
  }

  private calculateSpectralBandwidth(magnitudes: number[], centroid: number): number {
    const weightedVariance = magnitudes.reduce((sum, mag, index) => {
      const deviation = (index / magnitudes.length) - centroid;
      return sum + mag * deviation * deviation;
    }, 0);

    const totalMagnitude = magnitudes.reduce((sum, mag) => sum + mag, 0);
    return totalMagnitude > 0 ? Math.sqrt(weightedVariance / totalMagnitude) : 0;
  }

  private calculateMFCCComplexity(features: AudioFeatures): number {
    if (!features.mfccMean) return 0;

    const variance = features.mfccMean.reduce((sum, coeff, index) => {
      if (index < this.modelWeights.mfcc.length) {
        return sum + Math.abs(coeff) * this.modelWeights.mfcc[index];
      }
      return sum;
    }, 0);

    return Math.min(1, variance / 10);
  }

  private calculateConsistencyScore(features: AudioFeatures): number {
    const entropyScore = features.entropyMean > 7 ? 0.7 : 0.3;
    const zcrScore = features.zcrMean < 0.05 ? 0.7 : 0.3;
    const spectralScore = features.spectralCentroidMean > 0.6 ? 0.7 : 0.3;

    const scores = [entropyScore, zcrScore, spectralScore];
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;

    return 1 - variance;
  }

  private calculateRegularityScore(features: AudioFeatures): number {
    const stds = [
      features.entropyStd || 0,
      features.zcrStd || 0,
      features.spectralCentroidStd || 0
    ];

    const avgStd = stds.reduce((sum, std) => sum + std, 0) / stds.length;
    return Math.max(0, 1 - avgStd);
  }

  private calculateSkewness(mean: number, std: number): number {
    return (mean - 0.5) * std;
  }

  private calculateFeatureCorrelation(features: AudioFeatures): number {
    const entropyNorm = Math.max(0, Math.min(1, features.entropyMean / 8));
    const zcrNorm = Math.max(0, Math.min(1, features.zcrMean));
    const spectralNorm = features.spectralCentroidMean;

    const correlation = Math.abs(entropyNorm - zcrNorm) + Math.abs(spectralNorm - entropyNorm);
    return Math.min(0.5, correlation / 2);
  }

  private detectOutliers(features: AudioFeatures): number {
    const thresholds = {
      entropy: { min: 5, max: 8 },
      zcr: { min: 0, max: 0.3 },
      spectral: { min: 0, max: 1 }
    };

    let outlierCount = 0;

    if (features.entropyMean < thresholds.entropy.min || features.entropyMean > thresholds.entropy.max) {
      outlierCount++;
    }
    if (features.zcrMean < thresholds.zcr.min || features.zcrMean > thresholds.zcr.max) {
      outlierCount++;
    }
    if (features.spectralCentroidMean < thresholds.spectral.min || features.spectralCentroidMean > thresholds.spectral.max) {
      outlierCount++;
    }

    return outlierCount / 3;
  }

  private calculateEntropy(audioBuffer: Buffer): number {
    const histogram = new Array(256).fill(0);

    for (let i = 0; i < audioBuffer.length; i++) {
      histogram[audioBuffer[i]]++;
    }

    const entropy = histogram.reduce((sum, count) => {
      if (count > 0) {
        const probability = count / audioBuffer.length;
        return sum - probability * Math.log2(probability);
      }
      return sum;
    }, 0);

    return entropy;
  }

  private calculateEntropyStd(audioBuffer: Buffer): number {
    const windowSize = 256;
    const entropies: number[] = [];

    for (let start = 0; start < audioBuffer.length - windowSize; start += windowSize / 2) {
      const window = audioBuffer.slice(start, start + windowSize);
      const histogram = new Array(256).fill(0);

      for (let i = 0; i < window.length; i++) {
        histogram[window[i]]++;
      }

      let entropy = 0;
      for (let i = 0; i < 256; i++) {
        if (histogram[i] > 0) {
          const probability = histogram[i] / window.length;
          entropy -= probability * Math.log2(probability);
        }
      }

      entropies.push(entropy);
    }

    if (entropies.length === 0) return 0;

    const mean = entropies.reduce((sum, e) => sum + e, 0) / entropies.length;
    const variance = entropies.reduce((sum, e) => sum + Math.pow(e - mean, 2), 0) / entropies.length;

    return Math.sqrt(variance);
  }

  private calculateZeroCrossingRate(audioBuffer: Buffer): number {
    let crossings = 0;

    for (let i = 1; i < audioBuffer.length; i++) {
      if ((audioBuffer[i] > 128) !== (audioBuffer[i - 1] > 128)) {
        crossings++;
      }
    }

    return crossings / audioBuffer.length;
  }

  private calculateZeroCrossingRateFromData(audioData: number[]): number {
    let crossings = 0;

    for (let i = 1; i < audioData.length; i++) {
      if ((audioData[i] >= 0) !== (audioData[i - 1] >= 0)) {
        crossings++;
      }
    }

    return audioData.length > 0 ? crossings / audioData.length : 0;
  }

  private generateReasoning(features: AudioFeatures, classification: string, score: number): string[] {
    const reasoning: string[] = [];
    const isAI = classification === 'AI_GENERATED';

    if (features.entropyMean > 7.5) {
      reasoning.push(isAI
        ? 'High entropy detected, consistent with AI-generated speech patterns'
        : 'High entropy indicates natural speech variations'
      );
    } else {
      reasoning.push(isAI
        ? 'Moderate entropy detected'
        : 'Low to moderate entropy, typical of natural human speech'
      );
    }

    if (features.zcrMean < 0.05) {
      reasoning.push(isAI
        ? 'Low zero-crossing rate suggests synthetic generation'
        : 'Low zero-crossing rate with other factors'
      );
    } else {
      reasoning.push(isAI
        ? 'Moderate zero-crossing rate'
        : 'Natural zero-crossing rate pattern detected'
      );
    }

    if (features.spectralCentroidMean > 0.6) {
      reasoning.push(isAI
        ? 'High spectral centroid characteristic of AI voices'
        : 'High spectral centroid indicates articulate speech'
      );
    }

    reasoning.push(`Confidence score: ${(Math.abs(score - 0.5) * 2 * 100).toFixed(1)}%`);

    return reasoning;
  }

  private getFeaturesAnalyzedList(features: AudioFeatures): string[] {
    return [
      'Entropy Analysis',
      'Zero-Crossing Rate',
      'Spectral Centroid',
      'Spectral Rolloff',
      'MFCC Coefficients',
      'Duration Patterns',
      'Bandwidth Analysis'
    ];
  }
}
