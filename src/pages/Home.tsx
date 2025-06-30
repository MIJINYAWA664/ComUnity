import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Hand, 
  Mic, 
  MessageCircle, 
  Video, 
  ShieldAlert,
  GraduationCap,
  Zap,
  Users,
  Heart,
  Award
} from 'lucide-react';

const quickActions = [
  {
    to: '/sign-language',
    icon: Hand,
    title: 'Sign Language',
    description: 'Real-time gesture recognition',
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    to: '/speech-recognition',
    icon: Mic,
    title: 'Speech Recognition',
    description: 'Voice to text conversion',
    color: 'bg-green-500',
    gradient: 'from-green-500 to-green-600'
  },
  {
    to: '/emergency',
    icon: ShieldAlert,
    title: 'Emergency',
    description: 'Quick emergency assistance',
    color: 'bg-red-500',
    gradient: 'from-red-500 to-red-600'
  },
  {
    to: '/quick-access',
    icon: Zap,
    title: 'Quick Access',
    description: 'Common phrases & tools',
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-600'
  }
];

const features = [
  {
    to: '/chat',
    icon: MessageCircle,
    title: 'Interactive Chat',
    description: 'Real-time messaging with auto-translation'
  },
  {
    to: '/video-call',
    icon: Video,
    title: 'Video Calling',
    description: 'HD video calls with sign language support'
  },
  {
    to: '/learning',
    icon: GraduationCap,
    title: 'Learning Hub',
    description: 'Interactive sign language tutorials'
  }
];

const stats = [
  { icon: Users, label: 'Active Users', value: '50K+' },
  { icon: Heart, label: 'Success Rate', value: '98%' },
  { icon: Award, label: 'Languages', value: '25+' }
];

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <Zap className="w-10 h-10 text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">CommUnity</span>
        </h1>
        <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
          Breaking down communication barriers and connecting communities through innovative technology and inclusive design.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid grid-cols-3 gap-4"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center"
            >
              <Icon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={action.to}
                  className={`block p-6 rounded-2xl bg-gradient-to-br ${action.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <Icon className="w-8 h-8 mb-3" />
                  <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                  <p className="text-white/90 text-sm">{action.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-bold text-gray-900">Explore Features</h2>
        <div className="space-y-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={feature.to}
                  className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all duration-300"
                >
                  <div className="p-3 bg-primary-50 rounded-xl mr-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}