import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loveNotesAPI, moodboardAPI } from '../utils/api';
import { LoveNote, Moodboard } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const LoveNotesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [showSendModal, setShowSendModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    moodboardId: '',
    expiresAt: ''
  });
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch love notes
  const { data: receivedNotes, isLoading: receivedLoading, error: receivedError } = useQuery({
    queryKey: ['love-notes', 'received'],
    queryFn: () => loveNotesAPI.getReceivedLoveNotes(),
    retry: 1,
  });

  const { data: sentNotes, isLoading: sentLoading, error: sentError } = useQuery({
    queryKey: ['love-notes', 'sent'],
    queryFn: () => loveNotesAPI.getSentLoveNotes(),
    retry: 1,
  });

  // Fetch moodboards for the form
  const { data: moodboardsData } = useQuery({
    queryKey: ['moodboards'],
    queryFn: () => moodboardAPI.getMoodboards(),
  });

  // Send love note mutation
  const sendLoveNoteMutation = useMutation({
    mutationFn: (data: any) => loveNotesAPI.sendLoveNote({
      ...data,
      receiverId: user?.partnerId as string
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['love-notes'] });
      setShowSendModal(false);
      setFormData({ title: '', content: '', moodboardId: '', expiresAt: '' });
      toast.success('Love note sent successfully! 💕');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send love note');
    },
  });

  const handleSendLoveNote = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Please fill in title and content');
      return;
    }

    if (!user?.partnerId) {
      toast.error('You need to be connected with a partner to send love notes');
      return;
    }

    sendLoveNoteMutation.mutate({
      title: formData.title,
      content: formData.content,
      moodboardId: formData.moodboardId || undefined,
      expiresAt: formData.expiresAt || undefined
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const moodboards = moodboardsData?.data || [];
  const receivedNotesList = receivedNotes?.data || [];
  const sentNotesList = sentNotes?.data || [];

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
            Love Notes 💕
          </h1>
          <p className="text-lg text-romantic-charcoal opacity-70 max-w-2xl mx-auto">
            Share your feelings with your partner through beautiful love notes.
          </p>
        </motion.div>

        {/* Send Button */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setShowSendModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
          >
            Send Love Note 💌
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
                {receivedNotesList.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-white/30 rounded-full text-xs">
                    {receivedNotesList.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'sent'
                    ? 'bg-romantic-pink text-white shadow-lg'
                    : 'text-romantic-charcoal hover:bg-white/20'
                }`}
              >
                Sent
                {sentNotesList.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-white/30 rounded-full text-xs">
                    {sentNotesList.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notes List */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Error Display */}
          {(receivedError || sentError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="font-medium">Unable to load love notes</p>
              <p className="text-sm mt-1">
                {receivedError?.message || sentError?.message || 'Please check your connection and try again.'}
              </p>
            </div>
          )}
          
          {activeTab === 'received' ? (
            receivedLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-romantic-charcoal">Loading received love notes... 💕</p>
              </div>
            ) : receivedNotesList.length > 0 ? (
              <div className="grid gap-6">
                {receivedNotesList.map((note: LoveNote) => (
                  <motion.div
                    key={note._id}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-romantic-charcoal">
                        {note.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {!note.isRead && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                            New
                          </span>
                        )}
                        {note.isFavorite && (
                          <span className="text-romantic-pink">⭐</span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-romantic-charcoal opacity-70 mb-4">
                      {note.content}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm text-romantic-charcoal opacity-70">
                      <span>From: {note.sender?.firstName} {note.sender?.lastName}</span>
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">💌</div>
                <h3 className="text-lg font-medium text-romantic-charcoal mb-2">No love notes yet</h3>
                <p className="text-romantic-charcoal opacity-70">Your partner will send you love notes here!</p>
              </div>
            )
          ) : (
            sentLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-romantic-charcoal">Loading sent love notes... 💕</p>
              </div>
            ) : sentNotesList.length > 0 ? (
              <div className="grid gap-6">
                {sentNotesList.map((note: LoveNote) => (
                  <motion.div
                    key={note._id}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-romantic-charcoal">
                        {note.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {note.isRead && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            Read
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-romantic-charcoal opacity-70 mb-4">
                      {note.content}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm text-romantic-charcoal opacity-70">
                      <span>To: {note.receiver?.firstName} {note.receiver?.lastName}</span>
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">💌</div>
                <h3 className="text-lg font-medium text-romantic-charcoal mb-2">No sent love notes yet</h3>
                <p className="text-romantic-charcoal opacity-70">Send your first love note to your partner!</p>
              </div>
            )
          )}
        </motion.div>
      </div>

      {/* Send Love Note Modal */}
      <AnimatePresence>
        {showSendModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSendModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-romantic-charcoal">Send Love Note</h2>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="text-romantic-charcoal hover:text-romantic-pink transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSendLoveNote} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Title 💭
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Give your love note a title..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Message 💕
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Write your love message here..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent resize-none"
                    required
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

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Expires At (Optional) ⏰
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSendModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-romantic-charcoal rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendLoveNoteMutation.isPending}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {sendLoveNoteMutation.isPending ? 'Sending...' : 'Send Love Note 💕'}
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

export default LoveNotesPage; 