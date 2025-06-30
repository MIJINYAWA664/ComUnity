import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

export default function Header() {
  const { state } = useApp();
  const location = useLocation();

  const pageNames: Record<string, string> = {
    '/': 'CommUnity',
    '/sign-language': 'Sign Language',
    '/speech-recognition': 'Speech Recognition',
    '/chat': 'Chat',
    '/video-call': 'Video Call',
    '/emergency': 'Emergency',
    '/learning': 'Learning',
    '/quick-access': 'Quick Access',
    '/settings': 'Settings'
  };

  const currentPageName = pageNames[location.pathname] || 'CommUnity';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-xl"
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{currentPageName}</h1>
              {currentPageName !== 'CommUnity' && (
                <p className="text-xs text-gray-500">Communication Bridge</p>
              )}
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </motion.button>
            
            <Link to="/settings">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}