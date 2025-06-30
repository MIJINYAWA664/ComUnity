import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MoreHorizontal,
  Maximize,
  Hand,
  MessageCircle,
  Settings,
  Users,
  Monitor
} from 'lucide-react';

export default function VideoCall() {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [showControls, setShowControls] = useState(true);
  const [participants] = useState([
    { id: '1', name: 'You', isLocal: true },
    { id: '2', name: 'Jane Doe', isLocal: false, isOnline: true }
  ]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const startCall = async () => {
    setConnectionStatus('connecting');
    
    try {
      // Simulate getting local video stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Simulate connection delay
      setTimeout(() => {
        setConnectionStatus('connected');
        setIsConnected(true);
      }, 2000);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setConnectionStatus('disconnected');
    }
  };

  const endCall = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
      }
    }
  };

  useEffect(() => {
    let hideControlsTimer: NodeJS.Timeout;
    
    const resetHideTimer = () => {
      clearTimeout(hideControlsTimer);
      setShowControls(true);
      hideControlsTimer = setTimeout(() => {
        if (isConnected) {
          setShowControls(false);
        }
      }, 3000);
    };

    const handleMouseMove = () => resetHideTimer();
    const handleTouchStart = () => resetHideTimer();

    if (isConnected) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchstart', handleTouchStart);
      resetHideTimer();
    }

    return () => {
      clearTimeout(hideControlsTimer);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isConnected]);

  useEffect(() => {
    return () => {
      if (isConnected) {
        endCall();
      }
    };
  }, []);

  return (
    <div className="relative h-[calc(100vh-140px)] bg-gray-900 rounded-2xl overflow-hidden">
      {/* Video Grid */}
      <div className={`h-full ${isConnected ? 'grid grid-cols-1 md:grid-cols-2 gap-2 p-2' : 'flex items-center justify-center'}`}>
        {!isConnected ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 text-white"
          >
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <Video className="w-12 h-12" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Video Call</h1>
              <p className="text-gray-300">Connect with others through HD video calling</p>
            </div>
            
            {connectionStatus === 'connecting' ? (
              <div className="space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="mx-auto w-8 h-8 border-2 border-white border-t-transparent rounded-full"
                />
                <p className="text-gray-300">Connecting...</p>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startCall}
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-2xl transition-colors"
              >
                Start Call
              </motion.button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Remote Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-gray-800 rounded-xl overflow-hidden"
            >
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                poster="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400"
              />
              
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-white text-sm font-medium">Jane Doe</span>
              </div>
              
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <div className="bg-green-500 rounded-full p-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </motion.div>

            {/* Local Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-gray-800 rounded-xl overflow-hidden"
            >
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <div className="text-center text-white">
                    <VideoOff className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-400">Camera is off</p>
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-white text-sm font-medium">You</span>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Controls */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: showControls ? 1 : 0,
            y: showControls ? 0 : 20 
          }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="flex items-center space-x-4 bg-black/80 backdrop-blur-sm rounded-2xl px-6 py-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleAudio}
              className={`p-3 rounded-xl transition-colors ${
                isAudioOn 
                  ? 'bg-white/20 text-white hover:bg-white/30' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
              aria-label={isAudioOn ? 'Mute audio' : 'Unmute audio'}
            >
              {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleVideo}
              className={`p-3 rounded-xl transition-colors ${
                isVideoOn 
                  ? 'bg-white/20 text-white hover:bg-white/30' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
              aria-label={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Sign language interpreter"
            >
              <Hand className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Chat"
            >
              <MessageCircle className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Share screen"
            >
              <Monitor className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={endCall}
              className="p-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
              aria-label="End call"
            >
              <PhoneOff className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Participants Panel */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl p-3 min-w-[150px]"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Participants</span>
          </div>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${participant.isLocal ? 'bg-blue-500' : participant.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span className="text-white text-xs">{participant.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Connection Status */}
      {connectionStatus === 'connecting' && (
        <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
          Connecting...
        </div>
      )}
      
      {connectionStatus === 'connected' && (
        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
          Connected
        </div>
      )}
    </div>
  );
}