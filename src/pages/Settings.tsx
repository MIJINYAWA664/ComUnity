import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Accessibility, 
  Palette,
  Volume2,
  Vibrate,
  Eye,
  Type,
  Moon,
  Sun,
  Monitor,
  Globe,
  Download,
  Trash2,
  HelpCircle,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function Settings() {
  const { state, dispatch } = useApp();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const settingSections = [
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      description: 'Theme, colors, and display settings'
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      icon: Accessibility,
      description: 'Font size, contrast, and assistive features'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Alerts, sounds, and haptic feedback'
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: Shield,
      description: 'Data protection and security settings'
    },
    {
      id: 'language',
      title: 'Language & Region',
      icon: Globe,
      description: 'Language preferences and regional settings'
    },
    {
      id: 'data',
      title: 'Data & Storage',
      icon: Download,
      description: 'Backup, sync, and storage management'
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: HelpCircle,
      description: 'Documentation, tutorials, and contact'
    }
  ];

  const themes = [
    { id: 'light', name: 'Light', icon: Sun, description: 'Clean and bright interface' },
    { id: 'dark', name: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    { id: 'high-contrast', name: 'High Contrast', icon: Eye, description: 'Maximum visibility' }
  ];

  const fontSizes = [
    { id: 'small', name: 'Small', size: 'text-sm', description: 'Compact display' },
    { id: 'medium', name: 'Medium', size: 'text-base', description: 'Default size' },
    { id: 'large', name: 'Large', size: 'text-lg', description: 'Easier to read' }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' }
  ];

  const handleThemeChange = (theme: 'light' | 'dark' | 'high-contrast') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const handleAccessibilityChange = (setting: string, value: any) => {
    dispatch({ 
      type: 'SET_ACCESSIBILITY', 
      payload: { [setting]: value } 
    });
  };

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {themes.map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <motion.button
                      key={theme.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleThemeChange(theme.id as any)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        state.theme === theme.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          state.theme === theme.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">{theme.name}</div>
                          <div className="text-sm text-gray-500">{theme.description}</div>
                        </div>
                      </div>
                      {state.theme === theme.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-2 flex justify-end"
                        >
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Font Size</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fontSizes.map((size) => (
                  <motion.button
                    key={size.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAccessibilityChange('fontSize', size.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      state.accessibility.fontSize === size.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`${size.size} font-medium text-gray-900 mb-1`}>
                      {size.name}
                    </div>
                    <div className="text-sm text-gray-500">{size.description}</div>
                    {state.accessibility.fontSize === size.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-2 flex justify-end"
                      >
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Assistive Features</h3>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Vibrate className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Haptic Feedback</div>
                    <div className="text-sm text-gray-500">Vibration for interactions</div>
                  </div>
                </div>
                <button
                  onClick={() => handleAccessibilityChange('hapticFeedback', !state.accessibility.hapticFeedback)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    state.accessibility.hapticFeedback ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      state.accessibility.hapticFeedback ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Screen Reader</div>
                    <div className="text-sm text-gray-500">Voice announcements</div>
                  </div>
                </div>
                <button
                  onClick={() => handleAccessibilityChange('screenReader', !state.accessibility.screenReader)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    state.accessibility.screenReader ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      state.accessibility.screenReader ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              
              {[
                { key: 'messages', label: 'New Messages', description: 'Chat and video call notifications' },
                { key: 'emergency', label: 'Emergency Alerts', description: 'Critical safety notifications' },
                { key: 'learning', label: 'Learning Reminders', description: 'Daily practice suggestions' },
                { key: 'system', label: 'System Updates', description: 'App updates and maintenance' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">{setting.label}</div>
                    <div className="text-sm text-gray-500">{setting.description}</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
              
              {[
                { key: 'location', label: 'Location Services', description: 'Allow location access for emergency features' },
                { key: 'camera', label: 'Camera Access', description: 'Enable camera for sign language recognition' },
                { key: 'microphone', label: 'Microphone Access', description: 'Allow microphone for speech recognition' },
                { key: 'analytics', label: 'Usage Analytics', description: 'Help improve the app with anonymous data' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">{setting.label}</div>
                    <div className="text-sm text-gray-500">{setting.description}</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900">Data Protection</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    All your data is encrypted and stored securely. We never share personal information with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">App Language</h3>
              <button
                onClick={() => setShowLanguageModal(true)}
                className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🇺🇸</span>
                  <div>
                    <div className="font-medium text-gray-900">English</div>
                    <div className="text-sm text-gray-500">United States</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sign Language</h3>
              <div className="space-y-3">
                {[
                  { name: 'American Sign Language (ASL)', region: 'United States' },
                  { name: 'British Sign Language (BSL)', region: 'United Kingdom' },
                  { name: 'French Sign Language (LSF)', region: 'France' }
                ].map((lang, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900">{lang.name}</div>
                      <div className="text-sm text-gray-500">{lang.region}</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage</h3>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700">Used Storage</span>
                  <span className="font-semibold text-gray-900">2.3 GB of 5 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '46%' }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
              
              <button className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Export Data</div>
                    <div className="text-sm text-gray-500">Download your data</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={() => setShowResetModal(true)}
                className="flex items-center justify-between w-full p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="font-medium text-red-900">Reset App Data</div>
                    <div className="text-sm text-red-600">Clear all data and settings</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Help & Support</h3>
              
              {[
                { title: 'User Guide', description: 'Complete app documentation', icon: HelpCircle },
                { title: 'Video Tutorials', description: 'Step-by-step visual guides', icon: Monitor },
                { title: 'Community Forum', description: 'Connect with other users', icon: User },
                { title: 'Contact Support', description: 'Get help from our team', icon: Bell }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="font-semibold text-blue-900 mb-2">App Information</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div>Version: 2.1.0</div>
                <div>Last Updated: January 15, 2025</div>
                <div>Build: 2025.01.15.001</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
          <SettingsIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Customize your CommUnity experience</p>
      </motion.div>

      {/* Settings Sections */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100"
      >
        {activeSection ? (
          <div>
            <div className="p-4 border-b border-gray-100">
              <button
                onClick={() => setActiveSection(null)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>Back to Settings</span>
              </button>
            </div>
            <div className="p-6">
              {renderSection(activeSection)}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="space-y-2">
              {settingSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setActiveSection(section.id)}
                    className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">{section.title}</div>
                        <div className="text-sm text-gray-500">{section.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Language Modal */}
      {showLanguageModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowLanguageModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Language</h3>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setShowLanguageModal(false)}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium text-gray-900">{lang.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowResetModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reset App Data</h3>
                <p className="text-gray-600 mt-1">
                  This will permanently delete all your data, settings, and preferences. This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle reset logic here
                    setShowResetModal(false);
                  }}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Reset Data
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">Need Help?</h3>
            <p className="text-white/90 text-sm">Access tutorials and support resources</p>
          </div>
          <button className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors">
            Get Support
          </button>
        </div>
      </motion.div>
    </div>
  );
}