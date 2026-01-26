import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Music } from 'lucide-react';
import { AudioFile } from '../types/index';
import { fileToBase64, validateAudioFile, formatFileSize } from '../utils/audioUtils';

interface AudioUploaderProps {
    onAudioSelect: (audioFile: AudioFile) => void;
    selectedFile: AudioFile | null;
    onClear: () => void;
    isProcessing?: boolean;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({
    onAudioSelect,
    selectedFile,
    onClear,
    isProcessing = false
}) => {
    const [error, setError] = useState<string>('');

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setError('');

        const validation = validateAudioFile(file);
        if (!validation.isValid) {
            setError(validation.error || 'Invalid file');
            return;
        }

        try {
            const base64 = await fileToBase64(file);
            const audioFile: AudioFile = {
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                base64: base64,
                preview: URL.createObjectURL(file)
            };
            onAudioSelect(audioFile);
        } catch (err) {
            setError('Failed to process audio file');
        }
    }, [onAudioSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/*': ['.mp3', '.wav', '.m4a', '.mpeg']
        },
        multiple: false,
        disabled: isProcessing
    });

    return (
        <div className="w-full max-w-2xl mx-auto">
            {selectedFile ? (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Music className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{selectedFile.file.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {formatFileSize(selectedFile.file.size)}
                                </p>
                            </div>
                        </div>
                        {!isProcessing && (
                            <button
                                onClick={onClear}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <audio
                        controls
                        className="w-full"
                        src={selectedFile.preview}
                    />
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {isDragActive ? 'Drop your audio file here' : 'Upload Audio File'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Drag and drop an MP3, WAV, or M4A file here, or click to select
                    </p>
                    <p className="text-sm text-gray-400">
                        Maximum file size: 25MB
                    </p>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};

export default AudioUploader;
