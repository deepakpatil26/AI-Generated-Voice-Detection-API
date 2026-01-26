import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AudioUploader from '../AudioUploader';

// Mock the audio utilities
jest.mock('../../utils/audioUtils', () => ({
  fileToBase64: jest.fn().mockResolvedValue('base64-encoded-audio'),
  validateAudioFile: jest.fn().mockReturnValue({ isValid: true, error: null }),
  formatFileSize: jest.fn().mockReturnValue('1.5 MB'),
}));

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({ 'data-testid': 'dropzone' }),
    getInputProps: () => ({ 'data-testid': 'file-input' }),
    isDragActive: false,
  }),
}));

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Music: () => <div data-testid="music-icon">Music</div>,
}));

// Import mocked utilities for test manipulation
import { validateAudioFile } from '../../utils/audioUtils';

describe('AudioUploader Component', () => {
  const mockOnAudioSelect = jest.fn();
  const mockOnClear = jest.fn();
  const mockFile = new File(['test audio'], 'test.mp3', { type: 'audio/mpeg' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area correctly', () => {
    render(
      <AudioUploader
        onAudioSelect={mockOnAudioSelect}
        selectedFile={null}
        onClear={mockOnClear}
        isProcessing={false}
      />
    );

    expect(screen.getByText('Upload Audio File')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop an MP3, WAV, or M4A file here, or click to select')).toBeInTheDocument();
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    expect(screen.getByText('Maximum file size: 25MB')).toBeInTheDocument();
  });

  it('shows selected file information', () => {
    const selectedFile = {
      file: mockFile,
      name: 'test.mp3',
      size: 1500000,
      type: 'audio/mpeg',
      base64: 'base64-data',
      preview: 'data:audio/mpeg;base64,base64-data'
    };

    render(
      <AudioUploader
        onAudioSelect={mockOnAudioSelect}
        selectedFile={selectedFile}
        onClear={mockOnClear}
        isProcessing={false}
      />
    );

    expect(screen.getByText('test.mp3')).toBeInTheDocument();
    // The file size is not displayed in the actual component, so we'll check for the file name and audio element
    expect(screen.getByTestId('music-icon')).toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', async () => {
    const user = userEvent.setup();
    const selectedFile = {
      file: mockFile,
      name: 'test.mp3',
      size: 1500000,
      type: 'audio/mpeg',
      base64: 'base64-data',
      preview: 'data:audio/mpeg;base64,base64-data'
    };

    render(
      <AudioUploader
        onAudioSelect={mockOnAudioSelect}
        selectedFile={selectedFile}
        onClear={mockOnClear}
        isProcessing={false}
      />
    );

    // The clear button is the X icon button
    const clearButton = screen.getByTestId('x-icon').closest('button');
    if (clearButton) {
      await user.click(clearButton);
    }

    expect(mockOnClear).toHaveBeenCalled();
  });

  it('disables dropzone when processing', () => {
    render(
      <AudioUploader
        onAudioSelect={mockOnAudioSelect}
        selectedFile={null}
        onClear={mockOnClear}
        isProcessing={true}
      />
    );

    const dropzone = screen.getByTestId('dropzone');
    expect(dropzone).toHaveClass('opacity-50');
  });

  it('shows error message for invalid file type', async () => {
    (validateAudioFile as jest.Mock).mockReturnValue({ isValid: false, error: 'Invalid file type' });

    render(
      <AudioUploader
        onAudioSelect={mockOnAudioSelect}
        selectedFile={null}
        onClear={mockOnClear}
        isProcessing={false}
      />
    );

    // Simulate file input change with invalid file
    const fileInput = screen.getByTestId('file-input');
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText('Invalid file type')).toBeInTheDocument();
    });
  });
});
