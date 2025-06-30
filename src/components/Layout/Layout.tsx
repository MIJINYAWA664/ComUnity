import React from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import Navigation from './Navigation';
import { useApp } from '../../contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { state } = useApp();

  const themeClasses = {
    light: 'bg-gray-50 text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    'high-contrast': 'bg-black text-white'
  };

  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className={`min-h-screen ${themeClasses[state.theme]} ${fontSizeClasses[state.accessibility.fontSize]}`}>
      <Header />
      <main className="pb-20 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-4 py-6"
        >
          {children}
        </motion.div>
      </main>
      <Navigation />
    </div>
  );
}