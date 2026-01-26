import React, { useState } from 'react';
import { Brain, Mic, Settings, CheckCircle, XCircle, Bug } from 'lucide-react';
import AudioUploader from './components/AudioUploader';
import DebugPanel from './components/DebugPanel';
import { voiceDetectionAPI } from './services/api';
import { AudioFile, VoiceDetectionResponse } from './types';
import { fileToBase64 } from './utils/audioUtils';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VoiceDetectionResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  const handleAudioSelect = (audioFile: AudioFile) => {
    setSelectedFile(audioFile);
    setResult(null);
    setError('');
  };

  const handleClear = () => {
    setSelectedFile(null);
    setResult(null);
    setError('');
  };

  const handleDetectVoice = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError('');

    try {
      const audioBase64 = await fileToBase64(selectedFile.file);
      const response = await voiceDetectionAPI.detectVoice({
        audioBase64,
        language: selectedLanguage as any
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Detection failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDebugAnalysis = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError('');

    try {
      const audioBase64 = await fileToBase64(selectedFile.file);
      const response = await voiceDetectionAPI.analyzeAudio({
        audioBase64,
        language: selectedLanguage as any
      });
      // Show debug results in a simple alert for now
      alert(`Debug Analysis:\n\nFeatures:\n- Duration: ${response.features?.duration?.toFixed(2)}s\n- Entropy: ${response.features?.entropy?.toFixed(2)}\n- Zero Crossing Rate: ${response.features?.zeroCrossingRate?.toFixed(4)}\n\nReasoning:\n${response.analysis?.reasoning?.join('\n')}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Debug analysis failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const languages = ['English', 'Tamil', 'Hindi', 'Malayalam', 'Telugu'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <Brain className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              AI Voice Detection
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Detect whether a voice sample is AI-generated or spoken by a real human
          </p>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto">
          {/* Debug Panel */}
          <DebugPanel />

          {/* Language Selection */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Audio Uploader */}
          <AudioUploader
            onAudioSelect={handleAudioSelect}
            selectedFile={selectedFile}
            onClear={handleClear}
            isProcessing={isProcessing}
          />

          {/* Detect Button */}
          {selectedFile && !result && (
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={handleDetectVoice}
                disabled={isProcessing}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Mic className="w-5 h-5 mr-2" />
                {isProcessing ? 'Detecting...' : 'Detect Voice'}
              </button>
              <button
                onClick={handleDebugAnalysis}
                disabled={isProcessing}
                className="px-8 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Bug className="w-5 h-5 mr-2" />
                {isProcessing ? 'Analyzing...' : 'Debug Analysis'}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Detection Results</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Classification</p>
                  <p className={`text-lg font-semibold ${result.classification === 'AI_GENERATED'
                    ? 'text-orange-600'
                    : 'text-green-600'
                    }`}>
                    {result.classification === 'AI_GENERATED' ? '🤖 AI Generated' : '👤 Human'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Confidence</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className={`h-2 rounded-full ${result.confidence > 0.7 ? 'bg-green-500' :
                          result.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${result.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Language</p>
                  <p className="text-lg font-semibold text-gray-900">{result.language}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Processing Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.processingTimeMs}ms
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleClear}
                  className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Analyze Another Audio
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600">
          <p className="text-sm">
            AI Voice Detection API - Hackathon Project 2026
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
