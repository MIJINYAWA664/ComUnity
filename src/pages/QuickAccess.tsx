import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Volume2,
  Heart,
  Clock,
  MessageCircle,
  HelpCircle,
  Settings,
  Star
} from 'lucide-react';

interface QuickPhrase {
  id: string;
  text: string;
  category: string;
  usage: number;
  isFavorite: boolean;
}

export default function QuickAccess() {
  const [activeCategory, setActiveCategory] = useState('common');
  const [phrases, setPhrases] = useState<QuickPhrase[]>([
    { id: '1', text: 'Hello, how are you?', category: 'common', usage: 25, isFavorite: true },
    { id: '2', text: 'Thank you very much', category: 'common', usage: 18, isFavorite: false },
    { id: '3', text: 'I cannot hear you', category: 'communication', usage: 12, isFavorite: true },
    { id: '4', text: 'Please speak slowly', category: 'communication', usage: 15, isFavorite: false },
    { id: '5', text: 'I need help', category: 'emergency', usage: 8, isFavorite: true },
    { id: '6', text: 'Where is the bathroom?', category: 'questions', usage: 6, isFavorite: false },
    { id: '7', text: 'I am deaf/mute', category: 'communication', usage: 20, isFavorite: true },
    { id: '8', text: 'Can you write it down?', category: 'communication', usage: 14, isFavorite: false },
    { id: '9', text: 'I understand', category: 'common', usage: 16, isFavorite: false },
    { id: '10', text: 'Please be patient with me', category: 'communication', usage: 11, isFavorite: true }
  ]);
  
  const [showAddPhrase, setShowAddPhrase] = useState(false);
  const [newPhrase, setNewPhrase] = useState({ text: '', category: 'common' });

  const categories = [
    { id: 'all', name: 'All', icon: Zap, color: 'text-gray-600' },
    { id: 'favorites', name: 'Favorites', icon: Star, color: 'text-yellow-500' },
    { id: 'common', name: 'Common', icon: MessageCircle, color: 'text-blue-500' },
    { id: 'communication', name: 'Communication', icon: Volume2, color: 'text-green-500' },
    { id: 'questions', name: 'Questions', icon: HelpCircle, color: 'text-purple-500' },
    { id: 'emergency', name: 'Emergency', icon: Heart, color: 'text-red-500' }
  ];

  const getFilteredPhrases = () => {
    if (activeCategory === 'all') return phrases;
    if (activeCategory === 'favorites') return phrases.filter(p => p.isFavorite);
    return phrases.filter(p => p.category === activeCategory);
  };

  const toggleFavorite = (id: string) => {
    setPhrases(phrases.map(phrase => 
      phrase.id === id ? { ...phrase, isFavorite: !phrase.isFavorite } : phrase
    ));
  };

  const deletePhrase = (id: string) => {
    setPhrases(phrases.filter(phrase => phrase.id !== id));
  };

  const addPhrase = () => {
    if (newPhrase.text.trim()) {
      const phrase: QuickPhrase = {
        id: Date.now().toString(),
        text: newPhrase.text.trim(),
        category: newPhrase.category,
        usage: 0,
        isFavorite: false
      };
      setPhrases([...phrases, phrase]);
      setNewPhrase({ text: '', category: 'common' });
      setShowAddPhrase(false);
    }
  };

  const usePhrase = async (phrase: QuickPhrase) => {
    // Update usage count
    setPhrases(phrases.map(p => 
      p.id === phrase.id ? { ...p, usage: p.usage + 1 } : p
    ));

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(phrase.text);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }

    // Text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(phrase.text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredPhrases = getFilteredPhrases().sort((a, b) => b.usage - a.usage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Quick Access</h1>
        <p className="text-gray-600">Common phrases and communication tools</p>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddPhrase(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Phrase</span>
          </motion.button>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const count = category.id === 'all' 
              ? phrases.length 
              : category.id === 'favorites'
              ? phrases.filter(p => p.isFavorite).length
              : phrases.filter(p => p.category === category.id).length;
            
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category.id)}
                className={`p-4 rounded-xl text-center transition-colors ${
                  activeCategory === category.id
                    ? 'bg-orange-100 border-2 border-orange-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${
                  activeCategory === category.id ? 'text-orange-600' : category.color
                }`} />
                <div className={`text-sm font-medium ${
                  activeCategory === category.id ? 'text-orange-700' : 'text-gray-700'
                }`}>
                  {category.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">{count}</div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Phrases */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100"
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {categories.find(cat => cat.id === activeCategory)?.name} Phrases
            </h2>
            <span className="text-sm text-gray-500">
              {filteredPhrases.length} phrases
            </span>
          </div>
        </div>

        <div className="p-4">
          {filteredPhrases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No phrases in this category</p>
              <p className="text-sm">Add some phrases to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPhrases.map((phrase, index) => (
                <motion.div
                  key={phrase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="group p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-gray-900 font-medium leading-relaxed flex-1 pr-2">
                      {phrase.text}
                    </p>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleFavorite(phrase.id)}
                        className={`p-1 rounded-lg transition-colors ${
                          phrase.isFavorite 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                        aria-label="Toggle favorite"
                      >
                        <Star className={`w-4 h-4 ${phrase.isFavorite ? 'fill-current' : ''}`} />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deletePhrase(phrase.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Delete phrase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Used {phrase.usage} times</span>
                      </div>
                      {phrase.isFavorite && (
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Favorite</span>
                        </div>
                      )}
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => usePhrase(phrase)}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Use
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Phrase Modal */}
      {showAddPhrase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddPhrase(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Phrase</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phrase Text *
                </label>
                <textarea
                  value={newPhrase.text}
                  onChange={(e) => setNewPhrase({ ...newPhrase, text: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-colors resize-none"
                  placeholder="Enter your phrase..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newPhrase.category}
                  onChange={(e) => setNewPhrase({ ...newPhrase, category: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-colors"
                >
                  <option value="common">Common</option>
                  <option value="communication">Communication</option>
                  <option value="questions">Questions</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addPhrase}
                disabled={!newPhrase.text.trim()}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                Add Phrase
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddPhrase(false)}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Usage Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-orange-50 border border-orange-200 rounded-2xl p-4"
      >
        <div className="flex items-start space-x-3">
          <Zap className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-orange-900 mb-2">Quick Access Tips</h3>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Tap "Use" to copy text and hear it spoken aloud</li>
              <li>• Star your most-used phrases for quick access</li>
              <li>• Organize phrases by category for easy finding</li>
              <li>• Add custom phrases for your specific needs</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}