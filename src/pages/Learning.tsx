import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Star,
  Award,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
  progress: number;
  category: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export default function Learning() {
  const [activeCategory, setActiveCategory] = useState('basics');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const categories = [
    { id: 'basics', name: 'Basics', icon: '👋' },
    { id: 'alphabet', name: 'Alphabet', icon: '🔤' },
    { id: 'numbers', name: 'Numbers', icon: '🔢' },
    { id: 'phrases', name: 'Common Phrases', icon: '💬' },
    { id: 'emotions', name: 'Emotions', icon: '😊' },
    { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦' }
  ];

  const lessons: Lesson[] = [
    {
      id: '1',
      title: 'Hello & Goodbye',
      description: 'Learn basic greetings in sign language',
      duration: '5 min',
      difficulty: 'Beginner',
      completed: true,
      progress: 100,
      category: 'basics'
    },
    {
      id: '2',
      title: 'Please & Thank You',
      description: 'Essential polite expressions',
      duration: '7 min',
      difficulty: 'Beginner',
      completed: false,
      progress: 65,
      category: 'basics'
    },
    {
      id: '3',
      title: 'Letters A-M',
      description: 'First half of the sign language alphabet',
      duration: '10 min',
      difficulty: 'Beginner',
      completed: false,
      progress: 30,
      category: 'alphabet'
    },
    {
      id: '4',
      title: 'Numbers 1-10',
      description: 'Basic counting in sign language',
      duration: '8 min',
      difficulty: 'Beginner',
      completed: false,
      progress: 0,
      category: 'numbers'
    },
    {
      id: '5',
      title: 'I Need Help',
      description: 'Essential phrases for assistance',
      duration: '6 min',
      difficulty: 'Intermediate',
      completed: false,
      progress: 0,
      category: 'phrases'
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: '🎯',
      unlocked: true,
      progress: 1,
      maxProgress: 1
    },
    {
      id: '2',
      title: 'Alphabet Master',
      description: 'Learn the complete ASL alphabet',
      icon: '🔤',
      unlocked: false,
      progress: 1,
      maxProgress: 26
    },
    {
      id: '3',
      title: 'Week Streak',
      description: 'Practice for 7 days in a row',
      icon: '🔥',
      unlocked: false,
      progress: 3,
      maxProgress: 7
    },
    {
      id: '4',
      title: 'Helpful Hands',
      description: 'Master 20 common phrases',
      icon: '🙌',
      unlocked: false,
      progress: 5,
      maxProgress: 20
    }
  ];

  const filteredLessons = lessons.filter(lesson => lesson.category === activeCategory);
  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const totalProgress = Math.round((lessons.reduce((acc, lesson) => acc + lesson.progress, 0) / (lessons.length * 100)) * 100);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Learning Hub</h1>
        <p className="text-gray-600">Interactive sign language tutorials and practice</p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{completedLessons}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalProgress}%</div>
            <div className="text-sm text-gray-500">Overall Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">3</div>
            <div className="text-sm text-gray-500">Day Streak</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{totalProgress}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((category, index) => (
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
                  ? 'bg-purple-100 border-2 border-purple-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className={`text-sm font-medium ${
                activeCategory === category.id ? 'text-purple-700' : 'text-gray-700'
              }`}>
                {category.name}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Lessons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100"
      >
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {categories.find(cat => cat.id === activeCategory)?.name} Lessons
          </h2>
        </div>
        <div className="p-4 space-y-3">
          {filteredLessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedLesson(lesson)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                    {lesson.completed && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{lesson.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{lesson.duration}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">
                    {lesson.progress}%
                  </div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${lesson.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100"
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index }}
              className={`p-4 rounded-xl border-2 transition-all ${
                achievement.unlocked
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`text-2xl ${achievement.unlocked ? 'grayscale-0' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    achievement.unlocked ? 'text-yellow-800' : 'text-gray-600'
                  }`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${
                    achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                      <span>{Math.round((achievement.progress / achievement.maxProgress) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          achievement.unlocked ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Daily Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-4 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">Daily Challenge</h3>
            <p className="text-white/90 text-sm">Practice 5 new signs today</p>
            <div className="flex items-center space-x-2 mt-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">2/5 completed</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
          >
            Start Challenge
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}