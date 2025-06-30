import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Phone, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2,
  MessageCircle,
  Clock,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function Emergency() {
  const { state, dispatch } = useApp();
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relation: ''
  });

  const emergencyPhrases = [
    "I need help immediately",
    "Please call 911",
    "I cannot speak",
    "Medical emergency",
    "I am deaf/mute, please be patient",
    "Please write down your response",
    "I need a sign language interpreter",
    "This is an emergency"
  ];

  const quickActions = [
    {
      title: 'Call 911',
      description: 'Emergency services',
      action: () => window.location.href = 'tel:911',
      color: 'bg-red-500',
      icon: Phone
    },
    {
      title: 'Share Location',
      description: 'Send current location',
      action: () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            // In a real app, this would send location to emergency contacts
            alert(`Location: ${latitude}, ${longitude}`);
          });
        }
      },
      color: 'bg-blue-500',
      icon: MapPin
    },
    {
      title: 'Emergency Text',
      description: 'Send emergency message',
      action: () => {
        // In a real app, this would send SMS to emergency contacts
        alert('Emergency message sent to contacts');
      },
      color: 'bg-orange-500',
      icon: MessageCircle
    }
  ];

  const addEmergencyContact = () => {
    if (newContact.name && newContact.phone) {
      dispatch({
        type: 'ADD_EMERGENCY_CONTACT',
        payload: {
          id: Date.now().toString(),
          ...newContact
        }
      });
      setNewContact({ name: '', phone: '', relation: '' });
      setShowAddContact(false);
    }
  };

  const removeContact = (id: string) => {
    dispatch({
      type: 'REMOVE_EMERGENCY_CONTACT',
      payload: id
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
          <ShieldAlert className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Emergency</h1>
        <p className="text-gray-600">Quick access to emergency assistance and contacts</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className={`p-6 rounded-2xl ${action.color} text-white text-left transition-transform hover:shadow-lg`}
              >
                <Icon className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                <p className="text-white/90 text-sm">{action.description}</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100"
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Emergency Contacts</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddContact(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </motion.button>
          </div>
        </div>

        <div className="p-4">
          {state.emergency.contacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No emergency contacts added yet</p>
              <p className="text-sm">Add contacts for quick access during emergencies</p>
            </div>
          ) : (
            <div className="space-y-3">
              {state.emergency.contacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                      {contact.relation && (
                        <p className="text-xs text-gray-400">{contact.relation}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => window.location.href = `tel:${contact.phone}`}
                      className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      aria-label="Call contact"
                    >
                      <Phone className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeContact(contact.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      aria-label="Remove contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Emergency Phrases */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Phrases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {emergencyPhrases.map((phrase, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // In a real app, this could display the phrase prominently,
                // copy to clipboard, or convert to speech
                navigator.clipboard.writeText(phrase);
              }}
              className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100"
            >
              <p className="text-gray-900 font-medium">{phrase}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddContact(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Emergency Contact</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                  placeholder="Enter contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={newContact.relation}
                  onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                  placeholder="e.g., Family, Friend, Doctor"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addEmergencyContact}
                disabled={!newContact.name || !newContact.phone}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                Add Contact
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddContact(false)}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Safety Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4"
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">Emergency Safety Tips</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Keep your emergency contacts list updated</li>
              <li>• Practice using emergency features before you need them</li>
              <li>• Share your location with trusted contacts</li>
              <li>• Keep important medical information accessible</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}