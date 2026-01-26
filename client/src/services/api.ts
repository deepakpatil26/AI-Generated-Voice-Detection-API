import axios from 'axios';
import { HealthResponse, ErrorResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_KEY = process.env.REACT_APP_API_KEY;

if (!API_KEY) {
  console.error('REACT_APP_API_KEY is not set in environment variables');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
  timeout: 30000, // 30 seconds timeout for audio processing
});

export const voiceDetectionAPI = {
  detectVoice: async (data: { audioBase64: string; language: string }) => {
    try {
      const response = await api.post('/api/voice/detect', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || 'Voice detection failed');
      }
      throw new Error('Network error occurred');
    }
  },
  analyzeAudio: async (data: { audioBase64: string; language: string }) => {
    try {
      const response = await api.post('/api/debug/analyze', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || 'Audio analysis failed');
      }
      throw new Error('Network error occurred');
    }
  },
  getChecklist: async () => {
    try {
      const response = await api.get('/api/debug/checklist');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || 'Failed to get checklist');
      }
      throw new Error('Network error occurred');
    }
  },
};

export const healthAPI = {
  check: async (): Promise<HealthResponse> => {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || 'Health check failed');
      }
      throw new Error('Network error occurred');
    }
  },
};
