import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memoriesAPI, moodboardAPI } from '../utils/api';
import { Memory, Moodboard } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const MemoriesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'received' | 'shared'>('received');
  const [showShareModal, setShowShareModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    memoryDate: '',
    imageUrl: '',
    videoUrl: '',
    location: '',
    moodboardId: '',
    tags: ''
  });
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch memories
  const { data: receivedMemories, isLoading: receivedLoading, error: receivedError } = useQuery({
    queryKey: ['memories', 'received'],
    queryFn: () => memoriesAPI.getReceivedMemories(),
    retry: 1,
  });

  const { data: sharedMemories, isLoading: sharedLoading, error: sharedError } = useQuery({
    queryKey: ['memories', 'shared'],
    queryFn: () => memoriesAPI.getSharedMemories(),
    retry: 1,
  });

  // Fetch moodboards for the form
  const { data: moodboardsData } = useQuery({
    queryKey: ['moodboards'],
    queryFn: () => moodboardAPI.getMoodboards(),
  });

  // Share memory mutation
  const shareMemoryMutation = useMutation({
    mutationFn: (data: any) => memoriesAPI.shareMemory({
      ...data,
      receiverId: user?.partnerId as string,
      tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : []
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      setShowShareModal(false);
      setFormData({ title: '', description: '', memoryDate: '', imageUrl: '', videoUrl: '', location: '', moodboardId: '', tags: '' });
      toast.success('Memory shared successfully! 💕');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to share memory');
    },
  });

  const handleShareMemory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.memoryDate) {
      toast.error('Please fill in title, description, and memory date');
      return;
    }

    if (!user?.partnerId) {
      toast.error('You need to be connected with a partner to share memories');
      return;
    }

    shareMemoryMutation.mutate({
      title: formData.title,
      description: formData.description,
      memoryDate: new Date(formData.memoryDate),
      location: formData.location || undefined,
      moodboardId: formData.moodboardId || undefined,
      tags: formData.tags || undefined
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const moodboards = moodboardsData?.data || [];
  const receivedMemoriesList = receivedMemories?.data || [];
  const sharedMemoriesList = sharedMemories?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-romantic-peach/30 via-romantic-lavender/20 to-romantic-mint/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-romantic-charcoal mb-4">
            Shared Memories 📸
          </h1>
          <p className="text-lg text-romantic-charcoal opacity-70 max-w-2xl mx-auto">
            Share your precious moments and memories with your partner.
          </p>
        </motion.div>

        {/* Share Button */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setShowShareModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
          >
            Share Memory 📸
          </button>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2 border border-white/30">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('received')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'received'
                    ? 'bg-romantic-pink text-white shadow-lg'
                    : 'text-romantic-charcoal hover:bg-white/20'
                }`}
              >
                Received
                {receivedMemoriesList.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-white/30 rounded-full text-xs">
                    {receivedMemoriesList.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('shared')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'shared'
                    ? 'bg-romantic-pink text-white shadow-lg'
                    : 'text-romantic-charcoal hover:bg-white/20'
                }`}
              >
                Shared
                {sharedMemoriesList.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-white/30 rounded-full text-xs">
                    {sharedMemoriesList.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Memories List */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Error Display */}
          {(receivedError || sharedError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="font-medium">Unable to load memories</p>
              <p className="text-sm mt-1">
                {receivedError?.message || sharedError?.message || 'Please check your connection and try again.'}
              </p>
            </div>
          )}
          
          {activeTab === 'received' ? (
            receivedLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-romantic-charcoal">Loading received memories... 💕</p>
              </div>
            ) : receivedMemoriesList.length > 0 ? (
              <div className="grid gap-6">
                {receivedMemoriesList.map((memory: Memory) => (
                  <motion.div
                    key={memory._id}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-romantic-charcoal">
                        {memory.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {!memory.isRead && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                            New
                          </span>
                        )}
                        {memory.isFavorite && (
                          <span className="text-romantic-pink">⭐</span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-romantic-charcoal opacity-70 mb-4">
                      {memory.description}
                    </p>
                    
                    <div className="space-y-2 text-sm text-romantic-charcoal opacity-70">
                      <div>📅 {new Date(memory.memoryDate).toLocaleDateString()}</div>
                      {memory.location && <div>📍 {memory.location}</div>}
                      {memory.tags && memory.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {memory.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-romantic-pink/20 text-romantic-pink rounded-full text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-romantic-charcoal opacity-70 mt-4">
                      <span>From: {memory.sender?.firstName} {memory.sender?.lastName}</span>
                      <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📸</div>
                <h3 className="text-lg font-medium text-romantic-charcoal mb-2">No memories yet</h3>
                <p className="text-romantic-charcoal opacity-70">Your partner will share memories here!</p>
              </div>
            )
          ) : (
            sharedLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-romantic-charcoal">Loading shared memories... 💕</p>
              </div>
            ) : sharedMemoriesList.length > 0 ? (
              <div className="grid gap-6">
                {sharedMemoriesList.map((memory: Memory) => (
                  <motion.div
                    key={memory._id}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-romantic-charcoal">
                        {memory.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {memory.isRead && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            Viewed
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-romantic-charcoal opacity-70 mb-4">
                      {memory.description}
                    </p>
                    
                    <div className="space-y-2 text-sm text-romantic-charcoal opacity-70">
                      <div>📅 {new Date(memory.memoryDate).toLocaleDateString()}</div>
                      {memory.location && <div>📍 {memory.location}</div>}
                      {memory.tags && memory.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {memory.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-romantic-pink/20 text-romantic-pink rounded-full text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-romantic-charcoal opacity-70 mt-4">
                      <span>To: {memory.receiver?.firstName} {memory.receiver?.lastName}</span>
                      <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📸</div>
                <h3 className="text-lg font-medium text-romantic-charcoal mb-2">No shared memories yet</h3>
                <p className="text-romantic-charcoal opacity-70">Share your first memory with your partner!</p>
              </div>
            )
          )}
        </motion.div>
      </div>

      {/* Share Memory Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-romantic-charcoal">Share Memory</h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-romantic-charcoal hover:text-romantic-pink transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleShareMemory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Title 💭
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Give your memory a title..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Description 📝
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe this memory..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Memory Date 📅
                  </label>
                  <input
                    type="date"
                    value={formData.memoryDate}
                    onChange={(e) => handleInputChange('memoryDate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Location 📍
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Where did this happen?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Tags 🏷️
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="fun, vacation, dinner (comma separated)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Moodboard (Optional) 🎨
                  </label>
                  <select
                    value={formData.moodboardId}
                    onChange={(e) => handleInputChange('moodboardId', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                  >
                    <option value="">Select a moodboard</option>
                    {moodboards.map((moodboard: Moodboard) => (
                      <option key={moodboard._id} value={moodboard._id}>
                        {moodboard.moodName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-romantic-charcoal rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={shareMemoryMutation.isPending}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {shareMemoryMutation.isPending ? 'Sharing...' : 'Share Memory 💕'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoriesPage; 