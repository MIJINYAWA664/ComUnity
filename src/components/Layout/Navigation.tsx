import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Hand, 
  Mic, 
  MessageCircle, 
  Video, 
  ShieldAlert,
  GraduationCap,
  Zap
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/sign-language', icon: Hand, label: 'Sign' },
  { path: '/speech-recognition', icon: Mic, label: 'Speech' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/video-call', icon: Video, label: 'Video' },
  { path: '/emergency', icon: ShieldAlert, label: 'Emergency' },
  { path: '/learning', icon: GraduationCap, label: 'Learn' },
  { path: '/quick-access', icon: Zap, label: 'Quick' },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200"
    >
      <div className="container mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1"
                aria-label={item.label}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-primary-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <span className={`text-xs mt-1 font-medium truncate ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}