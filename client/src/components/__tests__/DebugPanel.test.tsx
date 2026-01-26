import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DebugPanel from '../DebugPanel';

// Mock the API service
jest.mock('../../services/api', () => ({
  voiceDetectionAPI: {
    getChecklist: jest.fn(),
    analyzeAudio: jest.fn(),
  },
}));

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  Bug: () => <div data-testid="bug-icon">Bug</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  CheckCircle: () => <div data-testid="check-icon">Check</div>,
}));

// Import the mocked API for test manipulation
import { voiceDetectionAPI } from '../../services/api';

// Type the mocked functions
const mockedVoiceDetectionAPI = voiceDetectionAPI as jest.Mocked<typeof voiceDetectionAPI>;

describe('DebugPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders debug panel correctly', () => {
    render(<DebugPanel />);

    expect(screen.getByText('Debug Panel')).toBeInTheDocument();
    expect(screen.getByText('Load Verification Checklist')).toBeInTheDocument();
    expect(screen.getByText('Analyze with Debug')).toBeInTheDocument();
    expect(screen.getByTestId('bug-icon')).toBeInTheDocument();
  });

  it('loads verification checklist when button clicked', async () => {
    const mockChecklist = {
      status: 'success',
      checklist: [
        { item: 'Audio format validation', status: 'passed' },
        { item: 'File size check', status: 'passed' },
      ]
    };

    mockedVoiceDetectionAPI.getChecklist.mockResolvedValue(mockChecklist);

    const user = userEvent.setup();
    render(<DebugPanel />);

    const loadButton = screen.getByText('Load Verification Checklist');
    await user.click(loadButton);

    await waitFor(() => {
      expect(mockedVoiceDetectionAPI.getChecklist).toHaveBeenCalled();
      expect(screen.getByText('Audio format validation')).toBeInTheDocument();
      expect(screen.getByText('File size check')).toBeInTheDocument();
    });
  });

  it('shows error when checklist loading fails', async () => {
    mockedVoiceDetectionAPI.getChecklist.mockRejectedValue(new Error('Network error'));

    const user = userEvent.setup();
    render(<DebugPanel />);

    const loadButton = screen.getByText('Load Verification Checklist');
    await user.click(loadButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to load checklist')).toBeInTheDocument();
    });
  });

  it('analyzes audio when debug analysis button clicked', async () => {
    const mockAnalysis = {
      status: 'success',
      analysis: {
        features: {
          entropy: 7.8,
          zeroCrossingRate: 0.04,
          spectralCentroid: 0.65
        },
        patterns: ['High entropy detected', 'Low zero crossing rate']
      }
    };

    mockedVoiceDetectionAPI.analyzeAudio.mockResolvedValue(mockAnalysis);

    const user = userEvent.setup();
    render(<DebugPanel />);

    const analyzeButton = screen.getByText('Analyze with Debug');
    await user.click(analyzeButton);

    await waitFor(() => {
      expect(mockedVoiceDetectionAPI.analyzeAudio).toHaveBeenCalled();
      expect(screen.getByText('Debug Analysis Results')).toBeInTheDocument();
    });
  });

  it('shows loading state during analysis', async () => {
    mockedVoiceDetectionAPI.analyzeAudio.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const user = userEvent.setup();
    render(<DebugPanel />);

    const analyzeButton = screen.getByText('Analyze with Debug');
    await user.click(analyzeButton);

    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
  });

  it('displays analysis results correctly', async () => {
    const mockAnalysis = {
      status: 'success',
      analysis: {
        features: {
          entropy: 7.8,
          zeroCrossingRate: 0.04,
          spectralCentroid: 0.65,
          duration: 3.5
        },
        patterns: ['High entropy detected', 'Low zero crossing rate'],
        confidence: 0.85
      }
    };

    mockedVoiceDetectionAPI.analyzeAudio.mockResolvedValue(mockAnalysis);

    const user = userEvent.setup();
    render(<DebugPanel />);

    const analyzeButton = screen.getByText('Analyze with Debug');
    await user.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText('7.8')).toBeInTheDocument(); // entropy
      expect(screen.getByText('0.04')).toBeInTheDocument(); // zcr
      expect(screen.getByText('85%')).toBeInTheDocument(); // confidence
      expect(screen.getByText('High entropy detected')).toBeInTheDocument();
    });
  });
});
