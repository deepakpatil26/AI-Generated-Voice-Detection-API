export interface VoiceDetectionRequest {
  audioBase64: string;
  language?: 'Tamil' | 'English' | 'Hindi' | 'Malayalam' | 'Telugu';
}

export interface VoiceDetectionResponse {
  status: 'success';
  classification: 'AI_GENERATED' | 'HUMAN';
  confidence: number;
  language: string;
  processingTimeMs: number;
  timestamp: string;
  explainability?: {
    reasoning: string[];
    featuresAnalyzed: string[];
    confidenceBreakdown?: {
      weightedScore: number;
      patternScore: number;
      statisticalScore: number;
    };
  };
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  code: string;
  timestamp?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  version: string;
  timestamp: string;
  uptime?: number;
  memory?: {
    used: number;
    total: number;
  };
}

export interface AudioFeatures {
  mfccMean: number[];
  mfccStd: number[];
  spectralCentroidMean: number;
  spectralCentroidStd: number;
  spectralRolloffMean: number;
  spectralRolloffStd: number;
  spectralBandwidthMean: number;
  spectralBandwidthStd: number;
  zcrMean: number;
  zcrStd: number;
  rmsMean: number;
  rmsStd: number;
  entropyMean: number;
  entropyStd: number;
  duration: number;
}

export interface MLModelResponse {
  classification: 'AI_GENERATED' | 'HUMAN';
  confidence: number;
  features?: AudioFeatures;
}
