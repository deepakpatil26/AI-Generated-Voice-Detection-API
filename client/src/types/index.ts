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
}

export interface AudioFile {
  file: File;
  name: string;
  size: number;
  type: string;
  base64: string;
  preview: string;
  duration?: number;
}
