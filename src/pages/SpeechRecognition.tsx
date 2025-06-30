import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Download,
  Trash2,
  Settings,
  Languages,
  Zap
} from 'lucide-react';

interface TranscriptionSegment {
  text: string;
  timestamp: number;
  confidence: number;
  isFinal: boolean;
}

export default function SpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [transcription, setTranscription] = useState<TranscriptionSegment[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [volume, setVolume] = useState(0);

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' }
  ];

  const startListening = async () => {
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setIsListening(true);
      setIsLoading(false);
      
      // Simulate real-time transcription
      const sampleTexts = [
        "Hello, how are you today?",
        "I need some help with communication.",
        "Thank you for your patience.",
        "Can you please repeat that?",
        "I understand what you're saying."
      ];
      
      let textIndex = 0;
      const interval = setInterval(() => {
        if (textIndex < sampleTexts.length) {
          const newSegment: TranscriptionSegment = {
            text: sampleTexts[textIndex],
            timestamp: Date.now(),
            confidence: Math.random() * 0.3 + 0.7, // 70-100%
            isFinal: true
          };
          
          setTranscription(prev => [newSegment, ...prev]);
          setCurrentText(sampleTexts[textIndex]);
          textIndex++;
        } else {
          setCurrentText('');
        }
      }, 3000);
      
      // Simulate volume levels
      const volumeInterval = setInterval(() => {
        setVolume(Math.random() * 100);
      }, 100);
      
      // Store intervals for cleanup
      (window as any).speechIntervals = [interval, volumeInterval];
    }, 1000);
  };

  const stopListening = () => {
    setIsListening(false);
    setCurrentText('');
    setVolume(0);
    
    // Clear intervals
    if ((window as any).speechIntervals) {
      (window as any).speechIntervals.forEach((interval: number) => clearInterval(interval));
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const downloadTranscription = () => {
    const text = transcription.map(segment => 
      `[${new Date(segment.timestamp).toLocaleTimeString()}] ${segment.text}`
    ).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearTranscription = () => {
    setTranscription([]);
    setCurrentText('');
  };

  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Speech Recognition</h1>
        <p className="text-gray-600">Real-time voice to text conversion</p>
      </motion.div>

      {/* Language Selection */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Languages className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Language</h2>
          </div>
        </div>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
          disabled={isListening}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Recording Interface */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Live Transcription</h2>
            <div className="flex items-center space-x-2">
              {isListening && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-3 h-3 bg-green-500 rounded-full"
                />
              )}
              <span className={`text-sm font-medium ${isListening ? 'text-green-600' : 'text-gray-500'}`}>
                {isListening ? 'LISTENING' : 'STOPPED'}
              </span>
            </div>
          </div>
        </div>

        {/* Audio Visualization */}
        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-center space-x-1 h-20 mb-6">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: isListening ? `${Math.random() * volume + 10}%` : '10%',
                }}
                transition={{
                  duration: 0.1,
                  repeat: isListening ? Infinity : 0,
                  repeatType: 'reverse'
                }}
                className={`w-2 bg-gradient-to-t from-green-400 to-green-600 rounded-full ${isListening ? 'opacity-100' : 'opacity-30'}`}
                style={{ minHeight: '8px' }}
              />
            ))}
          </div>

          {/* Current Text Display */}
          <div className="min-h-[100px] bg-white rounded-xl p-4 mb-6 border border-gray-200">
            {currentText ? (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg text-gray-900 leading-relaxed"
              >
                {currentText}
              </motion.p>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                {isListening ? (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    Listening for speech...
                  </motion.div>
                ) : (
                  'Press the microphone to start listening'
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Starting...' : isListening ? 'Stop Listening' : 'Start Listening'}</span>
            </motion.button>

            {transcription.length > 0 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadTranscription}
                  className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearTranscription}
                  className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Transcription History */}
      {transcription.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Transcription History</h2>
              <span className="text-sm text-gray-500">{transcription.length} segments</span>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {transcription.map((segment, index) => (
              <motion.div
                key={segment.timestamp}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <p className="text-gray-900 leading-relaxed">{segment.text}</p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>{new Date(segment.timestamp).toLocaleTimeString()}</span>
                    <span>Confidence: {Math.round(segment.confidence * 100)}%</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copyToClipboard(segment.text)}
                  className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Copy text"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-green-50 border border-green-200 rounded-2xl p-4"
      >
        <div className="flex items-start space-x-3">
          <Zap className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900 mb-2">Speech Recognition Tips</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Speak clearly and at a moderate pace</li>
              <li>• Minimize background noise for better accuracy</li>
              <li>• Use a good quality microphone when possible</li>
              <li>• Pause briefly between sentences</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}