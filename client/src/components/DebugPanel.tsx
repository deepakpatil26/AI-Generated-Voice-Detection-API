import React, { useState } from 'react';
import { Bug, Eye, CheckCircle } from 'lucide-react';
import { voiceDetectionAPI } from '../services/api';

const DebugPanel: React.FC = () => {
  const [checklist, setChecklist] = useState<string[]>([]);
  const [analysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadChecklist = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await voiceDetectionAPI.getChecklist();
      setChecklist(data.checklist || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  const analyzeCurrentAudio = async () => {
    setLoading(true);
    setError('');
    try {
      // This would need the current audio file from the main app
      // For now, just show a message
      setError('Upload an audio file first, then click "Analyze with Debug"');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <Bug className="w-5 h-5 text-yellow-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Debug Panel</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button
          onClick={loadChecklist}
          disabled={loading}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {loading ? 'Loading...' : 'Load Verification Checklist'}
        </button>

        <button
          onClick={analyzeCurrentAudio}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          <Eye className="w-4 h-4 mr-2" />
          {loading ? 'Analyzing...' : 'Analyze with Debug'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-200 rounded-lg mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {checklist.length > 0 && (
        <div className="bg-white p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Verification Checklist:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            {checklist.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis && (
        <div className="bg-white p-4 rounded-lg mt-4">
          <h3 className="font-semibold text-gray-900 mb-2">Audio Analysis:</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <div><strong>Features:</strong></div>
            <ul className="ml-4 space-y-1">
              <li>Duration: {analysis.features?.duration?.toFixed(2)}s</li>
              <li>Entropy: {analysis.features?.entropy?.toFixed(2)}</li>
              <li>Zero Crossing Rate: {analysis.features?.zeroCrossingRate?.toFixed(4)}</li>
            </ul>
            <div className="mt-2"><strong>Reasoning:</strong></div>
            <ul className="ml-4 space-y-1">
              {analysis.analysis?.reasoning?.map((reason: string, index: number) => (
                <li key={index} className="text-blue-600">• {reason}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-600">
          <strong>Direct API Testing:</strong><br/>
          • Checklist: <code className="bg-blue-100 px-1">GET /api/debug/checklist</code><br/>
          • Analysis: <code className="bg-blue-100 px-1">POST /api/debug/analyze</code><br/>
          • Visit <code className="bg-blue-100 px-1">http://localhost:8000/api/debug/checklist</code> in browser
        </p>
      </div>
    </div>
  );
};

export default DebugPanel;
