import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Mic, 
  Hand, 
  Languages, 
  MoreHorizontal,
  Smile,
  Paperclip,
  Phone,
  Video
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  timestamp: number;
  sender: 'user' | 'contact';
  type: 'text' | 'voice' | 'sign';
  translated?: string;
  originalLanguage?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How are you today?',
      timestamp: Date.now() - 300000,
      sender: 'contact',
      type: 'text'
    },
    {
      id: '2',
      text: 'I\'m doing well, thank you for asking!',
      timestamp: Date.now() - 240000,
      sender: 'user',
      type: 'text'
    },
    {
      id: '3',
      text: 'Can you help me understand sign language better?',
      timestamp: Date.now() - 180000,
      sender: 'contact',
      type: 'text'
    },
    {
      id: '4',
      text: 'Of course! I\'d be happy to help you learn.',
      timestamp: Date.now() - 120000,
      sender: 'user',
      type: 'text'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: Date.now(),
      sender: 'user',
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      // Simulate response
      const responses = [
        "That's very helpful, thank you!",
        "I understand now.",
        "Could you explain that again?",
        "That makes sense to me.",
        "Thank you for being patient."
      ];
      
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: Date.now(),
        sender: 'contact',
        type: 'text'
      };
      
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">JD</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Jane Doe</h2>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500">Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAutoTranslate(!autoTranslate)}
            className={`p-2 rounded-xl transition-colors ${
              autoTranslate 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label="Toggle auto-translate"
          >
            <Languages className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            aria-label="Voice call"
          >
            <Phone className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            aria-label="Video call"
          >
            <Video className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`p-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                } ${message.type === 'voice' ? 'bg-green-100 text-green-800' : ''} ${
                  message.type === 'sign' ? 'bg-purple-100 text-purple-800' : ''
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'voice' && <Mic className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  {message.type === 'sign' && <Hand className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="leading-relaxed">{message.text}</p>
                    {message.translated && (
                      <div className="mt-2 pt-2 border-t border-white/20">
                        <p className="text-sm opacity-90 italic">
                          Translation: {message.translated}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={`text-xs text-gray-500 mt-1 ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 rounded-2xl rounded-bl-md p-3">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      delay: i * 0.2
                    }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-t border-gray-200 bg-gray-50"
      >
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full p-3 pr-12 border border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors resize-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Add emoji"
              >
                <Smile className="w-5 h-5 text-gray-500" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Attach file"
              >
                <Paperclip className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white transition-colors"
              aria-label="Voice message"
            >
              <Mic className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white transition-colors"
              aria-label="Sign language"
            >
              <Hand className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="p-3 rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition-colors"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        {autoTranslate && (
          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
            <Languages className="w-3 h-3" />
            <span>Auto-translation enabled</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}