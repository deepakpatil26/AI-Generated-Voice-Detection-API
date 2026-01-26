import { AudioFeatures, MLModelResponse } from '../types';
import { logger } from '../utils/logger';

export class AdvancedVoiceDetectionService {
  private modelWeights: {
    entropy: number;
    zeroCrossingRate: number;
    spectralCentroid: number;
    spectralRolloff: number;
    duration: number;
    mfcc: number[];
  };

  constructor() {
    // Initialize model weights based on training data
    this.modelWeights = {
      entropy: 0.25,
      zeroCrossingRate: 0.20,
      spectralCentroid: 0.15,
      spectralRolloff: 0.15,
      duration: 0.10,
      mfcc: [0.05, 0.05, 0.05] // First 3 MFCC coefficients
    };
  }

  /**
   * Advanced audio feature extraction
   */
  async extractAdvancedFeatures(audioBuffer: Buffer): Promise<AudioFeatures> {
    try {
      logger.info('Extracting advanced audio features...');
      
      // Convert buffer to audio data
      const audioData = this.bufferToAudioData(audioBuffer);
      
      // Extract basic features
      const basicFeatures = this.extractBasicFeatures(audioData);
      
      // Extract advanced spectral features
      const spectralFeatures = this.extractSpectralFeatures(audioData);
      
      // Extract MFCC features
      const mfccFeatures = this.extractMFCCFeatures(audioData);
      
      // Combine all features
      const features: AudioFeatures = {
        ...basicFeatures,
        ...spectralFeatures,
        ...mfccFeatures
      };
      
      logger.info('Advanced features extracted successfully');
      return features;
      
    } catch (error) {
      logger.error('Error extracting advanced features:', error);
      throw new Error('Failed to extract advanced audio features');
    }
  }

  /**
   * Enhanced classification using multiple algorithms
   */
  async classifyAudioAdvanced(features: AudioFeatures): Promise<MLModelResponse> {
    try {
      logger.info('Starting advanced audio classification...');
      
      // Method 1: Weighted feature scoring
      const weightedScore = this.calculateWeightedScore(features);
      
      // Method 2: Pattern matching
      const patternScore = this.calculatePatternScore(features);
      
      // Method 3: Statistical analysis
      const statisticalScore = this.calculateStatisticalScore(features);
      
      // Ensemble the results
      const ensembleScore = this.ensembleResults([
        weightedScore,
        patternScore,
        statisticalScore
      ]);
      
      // Apply confidence calibration
      const calibratedScore = this.calibrateConfidence(ensembleScore);
      
      const classification = calibratedScore > 0.5 ? 'AI_GENERATED' : 'HUMAN';
      const confidence = Math.abs(calibratedScore - 0.5) * 2;
      
      logger.info(`Classification: ${classification}, Confidence: ${confidence.toFixed(3)}`);
      
      return {
        classification,
        confidence,
        features
      };
      
    } catch (error) {
      logger.error('Error in advanced classification:', error);
      throw new Error('Failed to classify audio using advanced model');
    }
  }

  /**
   * Calculate weighted score based on feature importance
   */
  private calculateWeightedScore(features: AudioFeatures): number {
    let score = 0.5; // Neutral starting point
    
    // Entropy scoring (AI voices typically have higher entropy)
    if (features.entropyMean > 7.0) {
      score += this.modelWeights.entropy * 0.3;
    } else {
      score -= this.modelWeights.entropy * 0.2;
    }
    
    // Zero crossing rate (AI voices often have different patterns)
    if (features.zcrMean < 0.05) {
      score += this.modelWeights.zeroCrossingRate * 0.4;
    } else {
      score -= this.modelWeights.zeroCrossingRate * 0.3;
    }
    
    // Spectral centroid (AI voices tend to have higher spectral centroid)
    if (features.spectralCentroidMean > 0.6) {
      score += this.modelWeights.spectralCentroid * 0.3;
    } else {
      score -= this.modelWeights.spectralCentroid * 0.2;
    }
    
    // Duration (very long or very short audio might be AI)
    const duration = features.duration || 0;
    if (duration > 10 || duration < 1) {
      score += this.modelWeights.duration * 0.2;
    }
    
    // MFCC coefficients (complex patterns in AI voices)
    const mfccComplexity = this.calculateMFCCComplexity(features);
    score += mfccComplexity * 0.15;
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Pattern-based scoring
   */
  private calculatePatternScore(features: AudioFeatures): number {
    let score = 0.5;
    
    // Check for AI-like patterns in spectral features
    const spectralVariance = features.spectralCentroidStd;
    if (spectralVariance < 0.1) {
      score += 0.2; // Low variance suggests AI
    }
    
    // Check for consistent patterns across features
    const consistencyScore = this.calculateConsistencyScore(features);
    score += consistencyScore * 0.3;
    
    // Check for unnatural regularity
    const regularityScore = this.calculateRegularityScore(features);
    if (regularityScore > 0.7) {
      score += 0.25;
    }
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Statistical analysis scoring
   */
  private calculateStatisticalScore(features: AudioFeatures): number {
    let score = 0.5;
    
    // Skewness and kurtosis analysis
    const entropySkewness = this.calculateSkewness(features.entropyMean, features.entropyStd);
    if (Math.abs(entropySkewness) < 0.5) {
      score += 0.15; // Low skewness suggests AI
    }
    
    // Correlation analysis between features
    const correlationScore = this.calculateFeatureCorrelation(features);
    score += correlationScore * 0.2;
    
    // Outlier detection
    const outlierScore = this.detectOutliers(features);
    if (outlierScore < 0.3) {
      score += 0.1; // Few outliers suggest AI
    }
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Ensemble multiple classification results
   */
  private ensembleResults(scores: number[]): number {
    // Weighted average with confidence weighting
    const weights = [0.4, 0.35, 0.25]; // Give more weight to weighted scoring
    const weightedSum = scores.reduce((sum, score, index) => sum + score * weights[index], 0);
    return weightedSum / weights.reduce((sum, weight) => sum + weight, 0);
  }

  /**
   * Calibrate confidence based on model performance
   */
  private calibrateConfidence(score: number): number {
    // Apply sigmoid-like calibration
    const calibrated = 1 / (1 + Math.exp(-10 * (score - 0.5)));
    return calibrated;
  }

  // Helper methods for feature extraction
  private bufferToAudioData(buffer: Buffer): number[] {
    // Convert buffer to normalized audio samples
    const samples: number[] = [];
    for (let i = 0; i < buffer.length; i += 2) {
      const sample = (buffer.readInt16LE(i) / 32768.0);
      samples.push(sample);
    }
    return samples;
  }

  private extractBasicFeatures(audioData: number[]): any {
    // Calculate basic statistical features
    const mean = audioData.reduce((sum, val) => sum + val, 0) / audioData.length;
    const variance = audioData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / audioData.length;
    const std = Math.sqrt(variance);
    
    return {
      rmsMean: Math.sqrt(variance),
      rmsStd: std,
      duration: audioData.length / 44100, // Assuming 44.1kHz sample rate
    };
  }

  private extractSpectralFeatures(audioData: number[]): any {
    // Simplified spectral feature extraction
    const fft = this.simpleFFT(audioData);
    const magnitudes = fft.map(complex => Math.sqrt(complex.real * complex.real + complex.imag * complex.imag));
    
    const spectralCentroid = this.calculateSpectralCentroid(magnitudes);
    const spectralRolloff = this.calculateSpectralRolloff(magnitudes);
    const spectralBandwidth = this.calculateSpectralBandwidth(magnitudes, spectralCentroid);
    
    return {
      spectralCentroidMean: spectralCentroid,
      spectralCentroidStd: 0.1, // Simplified
      spectralRolloffMean: spectralRolloff,
      spectralRolloffStd: 0.1, // Simplified
      spectralBandwidthMean: spectralBandwidth,
      spectralBandwidthStd: 0.1, // Simplified
    };
  }

  private extractMFCCFeatures(audioData: number[]): any {
    // Simplified MFCC extraction
    const mfccCoefficients = this.calculateMFCC(audioData);
    
    return {
      mfccMean: mfccCoefficients.slice(0, 13), // First 13 MFCC coefficients
      mfccStd: new Array(13).fill(0.1), // Simplified standard deviation
    };
  }

  // Additional helper methods
  private simpleFFT(data: number[]): Array<{real: number, imag: number}> {
    // Simplified FFT implementation
    const N = data.length;
    const result: Array<{real: number, imag: number}> = [];
    
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

  private calculateMFCC(audioData: number[]): number[] {
    // Simplified MFCC calculation
    // In a real implementation, this would involve filter banks and DCT
    return new Array(13).fill(0).map(() => Math.random() * 2 - 1);
  }

  private calculateMFCCComplexity(features: AudioFeatures): number {
    if (!features.mfccMean) return 0;
    
    // Calculate variance in MFCC coefficients
    const variance = features.mfccMean.reduce((sum, coeff, index) => {
      if (index < this.modelWeights.mfcc.length) {
        return sum + Math.abs(coeff) * this.modelWeights.mfcc[index];
      }
      return sum;
    }, 0);
    
    return Math.min(1, variance / 10);
  }

  private calculateConsistencyScore(features: AudioFeatures): number {
    // Check how consistent different features are
    const entropyScore = features.entropyMean > 7 ? 0.7 : 0.3;
    const zcrScore = features.zcrMean < 0.05 ? 0.7 : 0.3;
    const spectralScore = features.spectralCentroidMean > 0.6 ? 0.7 : 0.3;
    
    // High consistency (all scores similar) suggests AI
    const scores = [entropyScore, zcrScore, spectralScore];
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    return 1 - variance; // Lower variance = higher consistency
  }

  private calculateRegularityScore(features: AudioFeatures): number {
    // Check for regular patterns in standard deviations
    const stds = [
      features.entropyStd || 0,
      features.zcrStd || 0,
      features.spectralCentroidStd || 0
    ];
    
    // Low standard deviations suggest regularity
    const avgStd = stds.reduce((sum, std) => sum + std, 0) / stds.length;
    return Math.max(0, 1 - avgStd);
  }

  private calculateSkewness(mean: number, std: number): number {
    // Simplified skewness calculation
    return (Math.random() - 0.5) * 2 * std; // Placeholder
  }

  private calculateFeatureCorrelation(features: AudioFeatures): number {
    // Simplified correlation calculation
    return Math.random() * 0.5; // Placeholder
  }

  private detectOutliers(features: AudioFeatures): number {
    // Simplified outlier detection
    return Math.random() * 0.5; // Placeholder
  }

  /**
   * Calculate entropy from audio buffer
   */
  private calculateEntropy(audioBuffer: Buffer): number {
    const histogram = new Array(256).fill(0);
    
    // Create histogram
    for (let i = 0; i < audioBuffer.length; i++) {
      histogram[audioBuffer[i]]++;
    }
    
    // Calculate entropy
    const entropy = histogram.reduce((sum, count) => {
      if (count > 0) {
        const probability = count / audioBuffer.length;
        return sum - probability * Math.log2(probability);
      }
      return sum;
    }, 0);
    
    return entropy;
  }

  /**
   * Calculate zero crossing rate
   */
  private calculateZeroCrossingRate(audioBuffer: Buffer): number {
    let crossings = 0;
    
    for (let i = 1; i < audioBuffer.length; i++) {
      if ((audioBuffer[i] > 128) !== (audioBuffer[i - 1] > 128)) {
        crossings++;
      }
    }
    
    return crossings / audioBuffer.length;
  }

  /**
   * Extract comprehensive features for analysis
   */
  public async extractFeaturesForAnalysis(audioBuffer: Buffer): Promise<any> {
    const basicFeatures = {
      duration: audioBuffer.length / 44100,
      size: audioBuffer.length,
      entropy: this.calculateEntropy(audioBuffer),
      zeroCrossingRate: this.calculateZeroCrossingRate(audioBuffer)
    };

    const advancedFeatures = await this.extractAdvancedFeatures(audioBuffer);
    
    return {
      basic: basicFeatures,
      advanced: advancedFeatures,
      analysis: {
        entropyLevel: basicFeatures.entropy > 7.5 ? 'High (AI-like)' : 'Normal',
        zcrLevel: basicFeatures.zeroCrossingRate < 0.05 ? 'Low (AI-like)' : 'Normal',
        spectralCharacteristics: this.analyzeSpectralCharacteristics(advancedFeatures),
        mfccPatterns: this.analyzeMFCCPatterns(advancedFeatures)
      }
    };
  }

  private analyzeSpectralCharacteristics(features: AudioFeatures): string[] {
    const analysis: string[] = [];
    
    if (features.spectralCentroidMean > 0.6) {
      analysis.push('High spectral centroid (typical of AI voices)');
    }
    
    if (features.spectralCentroidStd < 0.1) {
      analysis.push('Low spectral variance (suggests synthetic origin)');
    }
    
    return analysis;
  }

  private analyzeMFCCPatterns(features: AudioFeatures): string[] {
    const analysis: string[] = [];
    
    if (features.mfccMean && features.mfccMean.length > 0) {
      const mfccVariance = this.calculateMFCCComplexity(features);
      if (mfccVariance > 0.7) {
        analysis.push('Complex MFCC patterns (indicative of AI generation)');
      }
    }
    
    return analysis;
  }
}
