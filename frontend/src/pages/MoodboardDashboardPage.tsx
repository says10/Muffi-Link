import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moodboardAPI } from '../utils/api';
import toast from 'react-hot-toast';

const MoodboardDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showSettings, setShowSettings] = useState(false);
  const [editData, setEditData] = useState({
    moodName: '',
    description: '',
    customText: '',
    isActive: true
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Get moodboard details
  const { data: moodboard, isLoading, error } = useQuery({
    queryKey: ['moodboard', id],
    queryFn: () => moodboardAPI.getMoodboard(id!),
    enabled: !!id,
  });

  // Update moodboard mutation
  const updateMoodboard = useMutation({
    mutationFn: (data: any) => moodboardAPI.updateMoodboard(id!, data),
    onSuccess: () => {
      toast.success('Moodboard updated successfully! 💕');
      queryClient.invalidateQueries({ queryKey: ['moodboard', id] });
      queryClient.invalidateQueries({ queryKey: ['moodboards'] });
      setShowSettings(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update moodboard');
    },
  });

  useEffect(() => {
    if (moodboard?.data) {
      setEditData({
        moodName: moodboard.data.moodName,
        description: moodboard.data.description,
        customText: moodboard.data.customText || '',
        isActive: moodboard.data.isActive
      });
      if (moodboard.data.images) {
        setUploadedImages(moodboard.data.images);
      }
    }
  }, [moodboard]);

  const handleSaveSettings = () => {
    updateMoodboard.mutate({
      ...editData,
      images: uploadedImages
    });
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setUploadedImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const getMoodColor = (theme: string) => {
    const moodColors: { [key: string]: string } = {
      romantic: '#FF6B9D',
      playful: '#F8B500', 
      cozy: '#C44569',
      dreamy: '#E3C6E3',
      passionate: '#FF4757',
      peaceful: '#A8E6CF'
    };
    return moodColors[theme] || '#FF6B9D';
  };

  const getMoodEmoji = (theme: string) => {
    const moodEmojis: { [key: string]: string } = {
      romantic: '💕',
      playful: '🎈',
      cozy: '🧸',
      dreamy: '✨',
      passionate: '🔥',
      peaceful: '🌸'
    };
    return moodEmojis[theme] || '💕';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-romantic-charcoal">Loading your moodboard... 💕</p>
        </div>
      </div>
    );
  }

  if (error || !moodboard?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-semibold text-romantic-charcoal mb-4">Moodboard not found</h2>
          <button
            onClick={() => navigate('/moodboards')}
            className="bg-romantic-pink text-white px-6 py-2 rounded-lg hover:bg-romantic-coral transition-colors duration-300"
          >
            Back to Moodboards
          </button>
        </div>
      </div>
    );
  }

  const mood = moodboard.data;

  return (
    <div className="min-h-screen p-4">
      <div 
        className="fixed inset-0 bg-gradient-to-br from-romantic-peach/20 via-romantic-lavender/10 to-romantic-mint/20"
        style={{ zIndex: -1 }}
      />
      
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/moodboards')}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 mr-4"
            >
              <svg className="w-6 h-6 text-romantic-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-romantic">
                <span className="bg-gradient-to-r from-romantic-pink to-romantic-coral bg-clip-text text-transparent">
                  {mood.moodName}
                </span>
              </h1>
              <p className="text-romantic-charcoal opacity-70">
                {getMoodEmoji(mood.theme)} {mood.theme.charAt(0).toUpperCase() + mood.theme.slice(1)} mood
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
          >
            <svg className="w-6 h-6 text-romantic-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold text-romantic-charcoal mb-6">Customize Your Moodboard</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                      Moodboard Name
                    </label>
                    <input
                      type="text"
                      value={editData.moodName}
                      onChange={(e) => setEditData(prev => ({ ...prev, moodName: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 text-romantic-charcoal placeholder-romantic-charcoal/50 focus:outline-none focus:ring-2 focus:ring-romantic-pink/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                      Description
                    </label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 text-romantic-charcoal placeholder-romantic-charcoal/50 focus:outline-none focus:ring-2 focus:ring-romantic-pink/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                      Custom Text
                    </label>
                    <textarea
                      value={editData.customText}
                      onChange={(e) => setEditData(prev => ({ ...prev, customText: e.target.value }))}
                      rows={2}
                      placeholder="Add your personal touch..."
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 text-romantic-charcoal placeholder-romantic-charcoal/50 focus:outline-none focus:ring-2 focus:ring-romantic-pink/50 resize-none"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editData.isActive}
                      onChange={(e) => setEditData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-romantic-pink bg-white/20 border-white/30 rounded focus:ring-romantic-pink/50 focus:ring-2"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-romantic-charcoal">
                      Set as active moodboard
                    </label>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Moodboard Images
                  </label>
                  
                  <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-romantic-pink/50 transition-all duration-300">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="mb-3">
                        <svg className="w-10 h-10 mx-auto text-romantic-charcoal opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-romantic-charcoal text-sm">
                        Click to add images or drag and drop
                      </p>
                    </label>
                  </div>

                  {/* Uploaded Images */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-romantic-charcoal mb-3">
                        Images ({uploadedImages.length})
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2 bg-white/20 text-romantic-charcoal rounded-lg hover:bg-white/30 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={updateMoodboard.isPending}
                  className="px-6 py-2 bg-romantic-pink text-white rounded-lg hover:bg-romantic-coral transition-colors duration-300 disabled:opacity-50"
                >
                  {updateMoodboard.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Moodboard Display */}
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20"
          style={{
            background: `linear-gradient(135deg, ${getMoodColor(mood.theme)}15, ${getMoodColor(mood.theme)}05)`
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Moodboard Header */}
          <div 
            className="h-32 relative flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${getMoodColor(mood.theme)}40, ${getMoodColor(mood.theme)}20)`
            }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">{getMoodEmoji(mood.theme)}</div>
              <h2 className="text-2xl font-bold text-romantic-charcoal">
                {mood.moodName}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {mood.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-romantic-charcoal mb-2">Description</h3>
                <p className="text-romantic-charcoal opacity-80">{mood.description}</p>
              </div>
            )}

            {mood.customText && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-romantic-charcoal mb-2">Personal Note</h3>
                <p className="text-romantic-charcoal opacity-80 italic">{mood.customText}</p>
              </div>
            )}

            {/* Images Gallery */}
            {uploadedImages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-romantic-charcoal mb-4">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <motion.img
                      key={index}
                      src={image}
                      alt={`${mood.moodName} ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  ))}
                </div>
              </div>
            )}

            {uploadedImages.length === 0 && !showSettings && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">{getMoodEmoji(mood.theme)}</div>
                <p className="text-romantic-charcoal opacity-70 mb-4">
                  Your {mood.theme} moodboard is ready to be customized!
                </p>
                <button
                  onClick={() => setShowSettings(true)}
                  className="bg-romantic-pink text-white px-6 py-3 rounded-lg hover:bg-romantic-coral transition-colors duration-300"
                >
                  Add Images & Customize
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Status Indicator */}
        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${mood.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></span>
            <span className="text-sm text-romantic-charcoal opacity-70">
              {mood.isActive ? 'Active Moodboard' : 'Inactive'}
            </span>
          </div>
          <div className="text-sm text-romantic-charcoal opacity-50">
            Created {new Date(mood.createdAt).toLocaleDateString()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MoodboardDashboardPage;
