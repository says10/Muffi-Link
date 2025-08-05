import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { moodboardAPI } from '../utils/api';
import { MoodOption } from '../types';
import toast from 'react-hot-toast';

const MoodboardPage: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Handle mood selection and navigation
  const handleMoodSelection = (mood: MoodOption) => {
    setSelectedMood(mood);
    // Save selected mood to localStorage for the next page
    localStorage.setItem('selectedMood', JSON.stringify(mood));
    // Navigate to mood creation page with mood data
    navigate('/create-moodboard', { state: { selectedMood: mood } });
  };

  // Handle selecting a moodboard as current mood and redirect to home
  const handleSelectMood = (moodboard: any) => {
    // First select the mood
    selectMoodMutation.mutate(moodboard._id);
    // Then redirect to home page (where services are listed)
    navigate('/');
  };

  // Handle customizing a moodboard - go to create-moodboard page for editing
  const handleCustomizeMood = (moodboard: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to create-moodboard page with the moodboard data for editing
    navigate('/create-moodboard', { 
      state: { 
        editMoodboard: moodboard,
        selectedMood: {
          id: moodboard.theme,
          name: moodboard.moodName,
          emoji: moodboard.emoji,
          color: moodboard.backgroundColor,
          description: moodboard.description
        }
      } 
    });
  };

  // Handle creating new moodboard
  const handleCreateNewMood = (mood: MoodOption) => {
    setSelectedMood(mood);
    localStorage.setItem('selectedMood', JSON.stringify(mood));
    navigate('/create-moodboard', { state: { selectedMood: mood } });
  };

  // Helper functions for mood display
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

  // Moodboard action handlers
  const handleEditMoodboard = (moodboard: any) => {
    // Navigate to edit page with moodboard data
    navigate('/create-moodboard', { state: { editMoodboard: moodboard } });
  };

  const handleViewMoodboard = (moodboard: any) => {
    // Navigate to moodboard dashboard page
    navigate(`/moodboards/${moodboard._id}`);
  };

  const handleDeleteMoodboard = (moodboardId: string) => {
    if (window.confirm('Are you sure you want to delete this moodboard? This action cannot be undone.')) {
      // TODO: Implement delete mutation
      toast.success('Moodboard deleted successfully!');
    }
  };

  // Fallback mood suggestions in case API fails
  const fallbackMoods: MoodOption[] = [
    {
      id: 'romantic',
      name: 'Romantic',
      emoji: '💕',
      color: '#FF6B9D',
      description: 'Perfect for date nights and intimate moments'
    },
    {
      id: 'playful',
      name: 'Playful',
      emoji: '🎈',
      color: '#F8B500',
      description: 'Fun and energetic vibes for adventure'
    },
    {
      id: 'cozy',
      name: 'Cozy',
      emoji: '🧸',
      color: '#C44569',
      description: 'Warm and comfortable atmosphere'
    },
    {
      id: 'dreamy',
      name: 'Dreamy',
      emoji: '✨',
      color: '#E3C6E3',
      description: 'Magical and ethereal feelings'
    },
    {
      id: 'passionate',
      name: 'Passionate',
      emoji: '🔥',
      color: '#FF4757',
      description: 'Intense and fiery emotions'
    },
    {
      id: 'peaceful',
      name: 'Peaceful',
      emoji: '🌸',
      color: '#A8E6CF',
      description: 'Calm and serene moments together'
    }
  ];

  // Get mood suggestions
  const { data: moodSuggestions, isLoading: loadingSuggestions, error: suggestionsError } = useQuery({
    queryKey: ['moodSuggestions'],
    queryFn: async () => {
      try {
        const response = await moodboardAPI.getMoodSuggestions();
        return response.data;
      } catch (error) {
        console.error('Failed to fetch mood suggestions:', error);
        // Return fallback data if API fails
        return { data: fallbackMoods };
      }
    },
  });

  // Use fallback moods if API failed or returned invalid data
  const moodsToDisplay = (moodSuggestions?.data && Array.isArray(moodSuggestions.data)) 
    ? moodSuggestions.data 
    : fallbackMoods;

  // Get user's moodboards
  const { data: moodboards, isLoading: loadingMoodboards } = useQuery({
    queryKey: ['moodboards'],
    queryFn: async () => {
      const response = await moodboardAPI.getMoodboards();
      return response.data;
    },
  });

  // Create moodboard mutation
  const createMoodboard = useMutation({
    mutationFn: moodboardAPI.createMoodboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moodboards'] });
      setShowCreateForm(false);
      setSelectedMood(null);
      toast.success('Moodboard created successfully! 🎨');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create moodboard');
    },
  });

  // Select mood mutation
  const selectMoodMutation = useMutation({
    mutationFn: moodboardAPI.selectMood,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['moodboards'] });
      toast.success(response.data?.message || 'Mood selected! 💕');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to select mood');
    },
  });

  const handleCreateMoodboard = (formData: {
    moodName: string;
    description: string;
    customText: string;
  }) => {
    if (!selectedMood) return;
    
    createMoodboard.mutate({
      ...formData,
      theme: selectedMood.id,
    });
  };

  if (loadingSuggestions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-romantic-charcoal">Loading moods... 💕</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-romantic mb-2">
            <span className="bg-gradient-to-r from-romantic-pink to-romantic-coral bg-clip-text text-transparent">
              Choose Your Mood
            </span>
          </h1>
          <p className="text-romantic-charcoal opacity-70">
            Create a beautiful moodboard that captures your feelings 💕
          </p>
        </div>

        {/* My Moodboards Section */}
        {moodboards?.data && Array.isArray(moodboards.data) && moodboards.data.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-romantic-charcoal">
                Your Moodboards ✨
              </h2>
              <div className="text-sm text-romantic-charcoal opacity-70">
                {moodboards.data.filter((mb: any) => !mb.isDefault).length}/5 Custom Moodboards
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {moodboards.data.map((moodboard: any) => (
                <motion.div
                  key={moodboard._id}
                  className={`relative bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 ${
                    moodboard.isActive ? 'border-romantic-pink shadow-romantic-pink/30' : 'border-transparent'
                  }`}
                  style={{ aspectRatio: '9/16' }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleSelectMood(moodboard)}
                >
                  {/* Active Badge */}
                  {moodboard.isActive && (
                    <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-romantic-pink text-white text-xs rounded-full">
                      ✨ Active
                    </div>
                  )}

                  {/* Settings Icon */}
                  <button
                    onClick={(e) => handleCustomizeMood(moodboard, e)}
                    className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/90 hover:scale-110"
                    title="Customize Moodboard"
                  >
                    <svg className="w-4 h-4 text-romantic-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  {/* Image Background or Gradient */}
                  <div className="absolute inset-0">
                    {moodboard.imageUrl ? (
                      <img
                        src={moodboard.imageUrl}
                        alt={moodboard.moodName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-full h-full"
                        style={{
                          background: `linear-gradient(135deg, ${getMoodColor(moodboard.theme)}60, ${getMoodColor(moodboard.theme)}30)`
                        }}
                      />
                    )}
                    {/* Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  </div>

                  {/* Content overlay */}
                  <div className="relative h-full flex flex-col justify-between p-4">
                    {/* Top section with emoji */}
                    <div className="flex justify-center">
                      <span className="text-3xl drop-shadow-lg">{moodboard.emoji || getMoodEmoji(moodboard.theme)}</span>
                    </div>

                    {/* Bottom section with text */}
                    <div className="text-center space-y-2">
                      <h3 className="text-white font-semibold text-lg drop-shadow-lg line-clamp-1">
                        {moodboard.moodName}
                      </h3>
                      <p className="text-white/90 text-sm line-clamp-2 drop-shadow">
                        {moodboard.description || moodboard.customText}
                      </p>
                      
                      {/* Status indicator */}
                      <div className="pt-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          moodboard.isActive 
                            ? 'bg-romantic-pink/80 text-white' 
                            : 'bg-white/20 text-white/80'
                        }`}>
                          {moodboard.isActive ? '✨ Active' : 'Tap to Select'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Mood Selection */}
        <AnimatePresence mode="wait">
          {!showCreateForm ? (
            <motion.div
              key="mood-selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {moodsToDisplay.map((mood: MoodOption) => (
                <motion.div
                  key={mood.id}
                  className={`relative cursor-pointer rounded-2xl transition-all duration-300 group overflow-hidden ${
                    selectedMood?.id === mood.id
                      ? 'bg-white/80 backdrop-blur-sm shadow-xl scale-105'
                      : 'bg-white/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-102'
                  }`}
                  style={{
                    aspectRatio: '9/16',
                    background: selectedMood?.id === mood.id 
                      ? `linear-gradient(135deg, ${mood.color}40, ${mood.color}20)`
                      : `linear-gradient(135deg, ${mood.color}30, ${mood.color}15)`
                  }}
                  onClick={() => handleCreateNewMood(mood)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Settings Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // For mood suggestions, go directly to create-moodboard page with mood data
                      navigate('/create-moodboard', { 
                        state: { 
                          selectedMood: mood,
                          isCustomizing: true
                        } 
                      });
                    }}
                    className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/90 hover:scale-110"
                    title="Customize this mood"
                  >
                    <svg className="w-4 h-4 text-romantic-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  {/* Content - centered vertically */}
                  <div className="h-full flex flex-col justify-center items-center text-center p-4">
                    <div className="text-4xl mb-4">{mood.emoji}</div>
                    <h3 className="text-lg font-semibold text-romantic-charcoal mb-2 line-clamp-1">
                      {mood.name}
                    </h3>
                    <p className="text-romantic-charcoal opacity-70 text-sm line-clamp-3">
                      {mood.description}
                    </p>
                  </div>
                  
                  {selectedMood?.id === mood.id && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-romantic-pink"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <CreateMoodboardForm
              key="create-form"
              selectedMood={selectedMood!}
              onSubmit={handleCreateMoodboard}
              onCancel={() => {
                setShowCreateForm(false);
                setSelectedMood(null);
              }}
              isLoading={createMoodboard.isPending}
            />
          )}
        </AnimatePresence>

        {/* Continue Button */}
        {selectedMood && !showCreateForm && (
          <motion.div
            className="flex justify-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-romantic-pink to-romantic-coral text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Create {selectedMood.name} Moodboard ✨
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

// Create Moodboard Form Component
interface CreateMoodboardFormProps {
  selectedMood: MoodOption;
  onSubmit: (data: { moodName: string; description: string; customText: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const CreateMoodboardForm: React.FC<CreateMoodboardFormProps> = ({
  selectedMood,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    moodName: '',
    description: '',
    customText: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
    >
      <h2 className="text-2xl font-semibold text-center mb-6">
        Create Your {selectedMood.name} Moodboard {selectedMood.emoji}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-romantic-charcoal mb-2">
            Moodboard Name 🎨
          </label>
          <input
            type="text"
            value={formData.moodName}
            onChange={(e) => setFormData({...formData, moodName: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-romantic-pink focus:ring-2 focus:ring-romantic-pink/20 transition-all"
            placeholder="e.g., Cozy Sunday Morning"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-romantic-charcoal mb-2">
            Description 📝
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-romantic-pink focus:ring-2 focus:ring-romantic-pink/20 transition-all"
            rows={3}
            placeholder="Describe the mood and feelings you want to capture..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-romantic-charcoal mb-2">
            Custom Message ✨ (Optional)
          </label>
          <input
            type="text"
            value={formData.customText}
            onChange={(e) => setFormData({...formData, customText: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-romantic-pink focus:ring-2 focus:ring-romantic-pink/20 transition-all"
            placeholder="A special message for your partner..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-romantic-pink to-romantic-coral text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Moodboard (5 credits)'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default MoodboardPage;
