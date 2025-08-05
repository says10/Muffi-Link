import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moodboardAPI } from '../utils/api';
import { MoodOption } from '../types';
import toast from 'react-hot-toast';

const CreateMoodboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [formData, setFormData] = useState({
    moodName: '',
    description: '',
    isActive: true,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Check if we're editing an existing moodboard
    const editMoodboard = location.state?.editMoodboard;
    if (editMoodboard) {
      setSelectedMood({
        id: editMoodboard.theme,
        name: editMoodboard.theme.charAt(0).toUpperCase() + editMoodboard.theme.slice(1),
        emoji: getMoodEmoji(editMoodboard.theme),
        color: getMoodColor(editMoodboard.theme),
        description: `Edit your ${editMoodboard.theme} moodboard`
      });
      setFormData({
        moodName: editMoodboard.moodName,
        description: editMoodboard.description,
        isActive: editMoodboard.isActive
      });
      if (editMoodboard.imageUrl) {
        setImagePreview(editMoodboard.imageUrl);
      }
      return;
    }

    // Get mood from navigation state or localStorage for new moodboard
    const mood = location.state?.selectedMood || JSON.parse(localStorage.getItem('selectedMood') || 'null');
    if (mood) {
      setSelectedMood(mood);
      setFormData(prev => ({
        ...prev,
        moodName: `My ${mood.name} Mood`,
        description: mood.description
      }));
    } else {
      // Redirect back if no mood selected
      navigate('/moodboards');
    }
  }, [location.state, navigate]);

  // Helper functions
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

  const createMoodboard = useMutation({
    mutationFn: async (data: any) => {
      const editMoodboard = location.state?.editMoodboard;
      let moodboard;
      
      if (editMoodboard) {
        // Update existing moodboard
        moodboard = await moodboardAPI.updateMoodboard(editMoodboard._id, data);
        
        // If there's a selected image, upload it
        if (selectedImage) {
          setIsUploading(true);
          const formData = new FormData();
          formData.append('media', selectedImage);
          
          try {
            await moodboardAPI.uploadMedia(editMoodboard._id, formData);
          } catch (uploadError) {
            console.error('Image upload failed:', uploadError);
            toast.error('Moodboard updated but image upload failed');
          } finally {
            setIsUploading(false);
          }
        }
      } else {
        // Create new moodboard
        moodboard = await moodboardAPI.createMoodboard(data);
        
        // If there's a selected image, upload it immediately after creation
        if (selectedImage && moodboard.data._id) {
          setIsUploading(true);
          const formData = new FormData();
          formData.append('media', selectedImage);
          
          try {
            const uploadResponse = await moodboardAPI.uploadMedia(moodboard.data._id, formData);
            // The upload endpoint automatically updates the moodboard with imageUrl
            console.log('Image uploaded successfully:', uploadResponse);
          } catch (uploadError) {
            console.error('Image upload failed:', uploadError);
            toast.error('Moodboard created but image upload failed');
          } finally {
            setIsUploading(false);
          }
        }
      }

      return moodboard;
    },
    onSuccess: () => {
      const isEditing = location.state?.editMoodboard;
      toast.success(isEditing ? 'Moodboard updated successfully! 💕' : 'Moodboard created successfully! 💕');
      queryClient.invalidateQueries({ queryKey: ['moodboards'] });
      navigate('/moodboards');
    },
    onError: (error: any) => {
      const isEditing = location.state?.editMoodboard;
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} moodboard`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    createMoodboard.mutate({
      ...formData,
      theme: selectedMood.id,
    });
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0]; // Only take the first file for single image upload
    if (file.type.startsWith('image/')) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  if (!selectedMood) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-romantic-charcoal">Loading... 💕</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div 
        className="fixed inset-0 bg-gradient-to-br from-romantic-peach/20 via-romantic-lavender/10 to-romantic-mint/20"
        style={{ zIndex: -1 }}
      />
      
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center mb-8">
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
                {location.state?.editMoodboard ? 'Edit Your' : 'Create Your'} {selectedMood.name} Moodboard
              </span>
            </h1>
            <p className="text-romantic-charcoal opacity-70">
              {selectedMood.emoji} {selectedMood.description}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-romantic-charcoal mb-6">Moodboard Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                  Moodboard Name *
                </label>
                <input
                  type="text"
                  value={formData.moodName}
                  onChange={(e) => setFormData(prev => ({ ...prev, moodName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 text-romantic-charcoal placeholder-romantic-charcoal/50 focus:outline-none focus:ring-2 focus:ring-romantic-pink/50"
                  placeholder="Give your moodboard a beautiful name..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 text-romantic-charcoal placeholder-romantic-charcoal/50 focus:outline-none focus:ring-2 focus:ring-romantic-pink/50 resize-none"
                  placeholder="Describe the feelings and moments this moodboard represents..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-romantic-pink bg-white/20 border-white/30 rounded focus:ring-romantic-pink/50 focus:ring-2"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-romantic-charcoal">
                  Set as active moodboard
                </label>
              </div>

              <button
                type="submit"
                disabled={createMoodboard.isPending || isUploading}
                className="w-full bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold py-3 px-6 rounded-lg hover:from-romantic-coral hover:to-romantic-pink transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMoodboard.isPending || isUploading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isUploading ? 'Uploading image...' : location.state?.editMoodboard ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  `✨ ${location.state?.editMoodboard ? 'Update' : 'Create'} Moodboard`
                )}
              </button>
            </form>
          </motion.div>

          {/* Image Upload Section */}
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-romantic-charcoal mb-6">Add Images</h2>
            
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                isDragging
                  ? 'border-romantic-pink bg-romantic-pink/10'
                  : 'border-white/30 hover:border-romantic-pink/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto text-romantic-charcoal opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-romantic-charcoal mb-2">
                  Drag and drop images here, or <span className="text-romantic-pink">click to browse</span>
                </p>
                <p className="text-sm text-romantic-charcoal opacity-50">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </label>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-romantic-charcoal mb-4">
                  Image Preview
                </h3>
                <motion.div
                  className="relative group max-w-sm mx-auto"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                    style={{ aspectRatio: '9/16' }}
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                  >
                    ×
                  </button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Preview Section */}
        <motion.div
          className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-romantic-charcoal mb-6">Preview</h2>
          <div
            className="rounded-xl p-6 min-h-[200px]"
            style={{
              background: `linear-gradient(135deg, ${selectedMood.color}20, ${selectedMood.color}10)`,
              border: `2px solid ${selectedMood.color}30`
            }}
          >
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">{selectedMood.emoji}</div>
              <h3 className="text-xl font-semibold text-romantic-charcoal">
                {formData.moodName || 'Your Moodboard Name'}
              </h3>
              <p className="text-romantic-charcoal opacity-70 mt-2">
                {formData.description || 'Your description will appear here...'}
              </p>
            </div>
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded"
                  style={{ aspectRatio: '9/16' }}
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CreateMoodboardPage;
