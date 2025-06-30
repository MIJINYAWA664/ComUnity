import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  CameraOff, 
  Hand, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw,
  Settings,
  Zap
} from 'lucide-react';

interface RecognitionResult {
  gesture: string;
  confidence: number;
  timestamp: number;
}

export default function SignLanguage() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<RecognitionResult[]>([]);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startRecognition = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        
        // Simulate recognition results
        const interval = setInterval(() => {
          const gestures = ['Hello', 'Thank you', 'Please', 'Help', 'Yes', 'No'];
          const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
          const randomConfidence = Math.random() * 0.4 + 0.6; // 60-100%
          
          setCurrentGesture(randomGesture);
          setConfidence(randomConfidence);
          
          setResults(prev => [{
            gesture: randomGesture,
            confidence: randomConfidence,
            timestamp: Date.now()
          }, ...prev.slice(0, 9)]);
        }, 2000);
        
        // Store interval ID for cleanup
        (videoRef.current as any).recognitionInterval = interval;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopRecognition = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Clear interval
      if ((videoRef.current as any).recognitionInterval) {
        clearInterval((videoRef.current as any).recognitionInterval);
      }
      
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setCurrentGesture(null);
    setConfidence(0);
  };

  const clearResults = () => {
    setResults([]);
  };

  useEffect(() => {
    return () => {
      if (isActive) {
        stopRecognition();
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
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Hand className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Sign Language Recognition</h1>
        <p className="text-gray-600">Real-time hand gesture detection and translation</p>
      </motion.div>

      {/* Camera Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Camera Feed</h2>
            <div className="flex items-center space-x-2">
              {isActive && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-3 h-3 bg-red-500 rounded-full"
                />
              )}
              <span className={`text-sm font-medium ${isActive ? 'text-red-600' : 'text-gray-500'}`}>
                {isActive ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        <div className="aspect-video bg-gray-900 relative overflow-hidden">
          {!isActive && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center space-y-4">
                <Camera className="w-16 h-16 text-gray-600 mx-auto" />
                <p className="text-gray-400">Camera is not active</p>
              </div>
            </motion.div>
          )}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
                />
                <p className="text-gray-400">Starting camera...</p>
              </div>
            </motion.div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
          />

          {/* Current Recognition Overlay */}
          {isActive && currentGesture && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <div className="text-lg font-bold">{currentGesture}</div>
                    <div className="text-sm opacity-75">
                      Confidence: {Math.round(confidence * 100)}%
                    </div>
                  </div>
                  <div className={`p-2 rounded-full ${confidence > 0.8 ? 'bg-green-500' : confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                    {confidence > 0.8 ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                  </div>
                </div>
                
                {/* Confidence Bar */}
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${confidence > 0.8 ? 'bg-green-500' : confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isActive ? stopRecognition : startRecognition}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                isActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : isActive ? (
                <CameraOff className="w-5 h-5" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Starting...' : isActive ? 'Stop' : 'Start Recognition'}</span>
            </motion.button>

            {results.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearResults}
                className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Results History */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100"
        >
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recognition History</h2>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {results.map((result, index) => (
              <motion.div
                key={result.timestamp}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${result.confidence > 0.8 ? 'bg-green-100 text-green-600' : result.confidence > 0.6 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                    <Hand className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{result.gesture}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {Math.round(result.confidence * 100)}%
                </div>
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
        className="bg-blue-50 border border-blue-200 rounded-2xl p-4"
      >
        <div className="flex items-start space-x-3">
          <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Recognition Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ensure good lighting for better accuracy</li>
              <li>• Keep your hands visible in the camera frame</li>
              <li>• Make clear, deliberate gestures</li>
              <li>• Position yourself 2-3 feet from the camera</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}