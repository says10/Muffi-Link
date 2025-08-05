import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsAPI, grievanceAPI, appointmentRatingAPI } from '../utils/api';
import { Service, Grievance } from '../types';
import toast from 'react-hot-toast';

const AccountabilityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'grievances'>('appointments');
  const [selectedAppointment, setSelectedAppointment] = useState<Service | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [ratingData, setRatingData] = useState({ rating: 5, feedback: '' });
  const [grievanceData, setGrievanceData] = useState({
    title: '',
    category: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    isAnonymous: false,
    tags: [] as string[]
  });
  
  const queryClient = useQueryClient();

  // Fetch completed appointments
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentsAPI.getAppointments(),
  });

  // Fetch grievances
  const { data: grievancesData, isLoading: grievancesLoading } = useQuery({
    queryKey: ['grievances'],
    queryFn: () => grievanceAPI.getGrievances(),
  });

  // Rating mutation
  const ratingMutation = useMutation({
    mutationFn: ({ appointmentId, rating, feedback }: { appointmentId: string; rating: number; feedback?: string }) =>
      appointmentRatingAPI.rateAppointment(appointmentId, rating, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setShowRatingModal(false);
      setSelectedAppointment(null);
      setRatingData({ rating: 5, feedback: '' });
      toast.success('Appointment rated successfully! 💕');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to rate appointment');
    },
  });

  // Grievance mutation
  const grievanceMutation = useMutation({
    mutationFn: (grievanceData: any) => grievanceAPI.createGrievance(grievanceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setShowGrievanceModal(false);
      setGrievanceData({
        title: '',
        category: '',
        description: '',
        severity: 'medium',
        isAnonymous: false,
        tags: []
      });
      toast.success('Grievance submitted successfully! 📝');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit grievance');
    },
  });

  // Calculate credit multiplier based on rating
  const getCreditMultiplier = (rating: number) => {
    switch (rating) {
      case 1: return 0.5; // 50% of original points
      case 2: return 0.75; // 75% of original points
      case 3: return 1.0; // 100% of original points
      case 4: return 1.25; // 125% of original points
      case 5: return 1.5; // 150% of original points
      default: return 1.0;
    }
  };

  // Get rating emoji and color
  const getRatingDisplay = (rating: number) => {
    const emojis = ['😞', '😕', '😐', '😊', '😍'];
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];
    return {
      emoji: emojis[rating - 1] || '😐',
      color: colors[rating - 1] || 'text-gray-500'
    };
  };

  const completedAppointments = appointmentsData && Array.isArray(appointmentsData.data) 
    ? appointmentsData.data.filter((appointment: Service) => 
        appointment.status === 'completed' && !appointment.rating
      )
    : [];

  const ratedAppointments = appointmentsData && Array.isArray(appointmentsData.data)
    ? appointmentsData.data.filter((appointment: Service) => 
        appointment.status === 'completed' && appointment.rating
      )
    : [];

  const grievances = grievancesData && Array.isArray(grievancesData.data) ? grievancesData.data : [];

  if (appointmentsLoading || grievancesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-romantic-charcoal">Loading accountability data... 💕</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-romantic-peach/30 via-romantic-lavender/20 to-romantic-mint/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-romantic-charcoal mb-4">
            Accountability Hub 📊
          </h1>
          <p className="text-lg text-romantic-charcoal opacity-70 max-w-2xl mx-auto">
            Rate your experiences and manage relationship accountability. Your feedback shapes your credit rewards!
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2 border border-white/30">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'appointments'
                    ? 'bg-romantic-pink text-white shadow-lg'
                    : 'text-romantic-charcoal hover:bg-white/20'
                }`}
              >
                Appointments
                {completedAppointments.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-white/30 rounded-full text-xs">
                    {completedAppointments.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('grievances')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'grievances'
                    ? 'bg-romantic-pink text-white shadow-lg'
                    : 'text-romantic-charcoal hover:bg-white/20'
                }`}
              >
                Grievances
                {grievances.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-white/30 rounded-full text-xs">
                    {grievances.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Pending Ratings */}
            {completedAppointments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-romantic-charcoal mb-6">
                  Rate Your Experiences ⭐
                </h2>
                <div className="grid gap-6">
                  {completedAppointments.map((appointment: Service) => (
                    <motion.div
                      key={appointment._id}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-romantic-charcoal">
                            {appointment.name}
                          </h3>
                          <p className="text-romantic-charcoal opacity-70 text-sm">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </p>
                          <p className="text-romantic-charcoal opacity-70 text-sm">
                            Original Credit Cost: {appointment.creditCost} points
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowRatingModal(true);
                          }}
                          className="bg-gradient-to-r from-romantic-pink to-romantic-coral text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all"
                        >
                          Rate Experience ⭐
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Rated Appointments */}
            {ratedAppointments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-romantic-charcoal mb-6">
                  Your Rated Experiences 📈
                </h2>
                <div className="grid gap-6">
                  {ratedAppointments.map((appointment: Service) => {
                    const multiplier = getCreditMultiplier(appointment.rating || 3);
                    const finalCredits = Math.round(appointment.creditCost * multiplier);
                    const ratingDisplay = getRatingDisplay(appointment.rating || 3);
                    
                    return (
                      <motion.div
                        key={appointment._id}
                        className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-romantic-charcoal">
                              {appointment.name}
                            </h3>
                            <p className="text-romantic-charcoal opacity-70 text-sm">
                              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                            </p>
                            {appointment.feedback && (
                              <p className="text-romantic-charcoal opacity-80 text-sm mt-2 italic">
                                "{appointment.feedback}"
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`text-3xl ${ratingDisplay.color}`}>
                              {ratingDisplay.emoji}
                            </div>
                            <div className="text-sm text-romantic-charcoal opacity-70">
                              Rating: {appointment.rating}/5
                            </div>
                            <div className="text-sm font-semibold text-romantic-pink">
                              {finalCredits} points earned
                            </div>
                            <div className="text-xs text-romantic-charcoal opacity-60">
                              {multiplier > 1 ? `+${Math.round((multiplier - 1) * 100)}% bonus` : 
                               multiplier < 1 ? `${Math.round((1 - multiplier) * 100)}% deduction` : 'Standard'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {completedAppointments.length === 0 && ratedAppointments.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-romantic-charcoal mb-2">No completed appointments yet</h3>
                <p className="text-romantic-charcoal opacity-70">Complete some appointments to start rating them!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Grievances Tab */}
        {activeTab === 'grievances' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Submit New Grievance */}
            <div className="text-center mb-8">
              <button
                onClick={() => setShowGrievanceModal(true)}
                className="bg-gradient-to-r from-romantic-lavender to-romantic-mint text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
              >
                📝 Submit New Grievance
              </button>
              <p className="text-sm text-romantic-charcoal opacity-70 mt-2">
                Report issues that may affect your credit balance
              </p>
            </div>

            {/* Grievances List */}
            {grievances.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-romantic-charcoal mb-6">
                  Your Grievances 📋
                </h2>
                <div className="grid gap-6">
                  {grievances.map((grievance: Grievance) => (
                    <motion.div
                      key={grievance._id}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-romantic-charcoal">
                            {grievance.title}
                          </h3>
                          <p className="text-romantic-charcoal opacity-70 text-sm">
                            Category: {grievance.category}
                          </p>
                          <p className="text-romantic-charcoal opacity-70 text-sm">
                            Severity: {grievance.severity}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          grievance.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          grievance.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {grievance.status}
                        </span>
                      </div>
                      <p className="text-romantic-charcoal opacity-80 mb-3">
                        {grievance.description}
                      </p>
                      {grievance.creditImpact > 0 && (
                        <div className="text-sm text-red-500 font-medium">
                          Credit Impact: -{grievance.creditImpact} points
                        </div>
                      )}
                      <div className="text-xs text-romantic-charcoal opacity-60 mt-2">
                        Submitted: {new Date(grievance.createdAt).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-romantic-charcoal mb-2">No grievances yet</h3>
                <p className="text-romantic-charcoal opacity-70">Submit a grievance if you need to report an issue!</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && selectedAppointment && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRatingModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-romantic-charcoal">Rate Your Experience</h2>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="text-romantic-charcoal hover:text-romantic-pink transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-romantic-charcoal mb-2">
                    {selectedAppointment.name}
                  </h3>
                  <p className="text-sm text-romantic-charcoal opacity-70">
                    {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-3">
                    How was your experience? ⭐
                  </label>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const ratingDisplay = getRatingDisplay(star);
                      return (
                        <button
                          key={star}
                          onClick={() => setRatingData(prev => ({ ...prev, rating: star }))}
                          className={`text-3xl transition-all ${
                            ratingData.rating >= star ? ratingDisplay.color : 'text-gray-300'
                          } hover:scale-110`}
                        >
                          {ratingDisplay.emoji}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-sm text-romantic-charcoal opacity-70">
                      {ratingData.rating === 1 && 'Poor 😞'} 
                      {ratingData.rating === 2 && 'Fair 😕'}
                      {ratingData.rating === 3 && 'Good 😐'}
                      {ratingData.rating === 4 && 'Great 😊'}
                      {ratingData.rating === 5 && 'Amazing 😍'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Feedback (Optional) 💭
                  </label>
                  <textarea
                    value={ratingData.feedback}
                    onChange={(e) => setRatingData(prev => ({ ...prev, feedback: e.target.value }))}
                    placeholder="Share your thoughts about this experience..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent resize-none"
                  />
                </div>

                <div className="bg-gradient-to-br from-romantic-pink/10 to-romantic-lavender/10 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-sm text-romantic-charcoal opacity-70 mb-1">Credit Reward</div>
                    <div className="text-2xl font-bold text-romantic-pink">
                      {Math.round(selectedAppointment.creditCost * getCreditMultiplier(ratingData.rating))} points
                    </div>
                    <div className="text-xs text-romantic-charcoal opacity-60">
                      {getCreditMultiplier(ratingData.rating) > 1 ? 
                        `+${Math.round((getCreditMultiplier(ratingData.rating) - 1) * 100)}% bonus` :
                        getCreditMultiplier(ratingData.rating) < 1 ?
                        `${Math.round((1 - getCreditMultiplier(ratingData.rating)) * 100)}% deduction` :
                        'Standard reward'
                      }
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowRatingModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-romantic-charcoal rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      ratingMutation.mutate({
                        appointmentId: selectedAppointment._id,
                        rating: ratingData.rating,
                        feedback: ratingData.feedback || undefined
                      });
                    }}
                    disabled={ratingMutation.isPending}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {ratingMutation.isPending ? 'Submitting...' : 'Submit Rating ⭐'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grievance Modal */}
      <AnimatePresence>
        {showGrievanceModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGrievanceModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-romantic-charcoal">Submit Grievance</h2>
                <button
                  onClick={() => setShowGrievanceModal(false)}
                  className="text-romantic-charcoal hover:text-romantic-pink transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                grievanceMutation.mutate(grievanceData);
              }} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Title 📝
                  </label>
                  <input
                    type="text"
                    value={grievanceData.title}
                    onChange={(e) => setGrievanceData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the issue..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Category 📂
                  </label>
                  <select
                    value={grievanceData.category}
                    onChange={(e) => setGrievanceData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="communication">Communication Issues</option>
                    <option value="behavior">Behavior Issues</option>
                    <option value="responsibility">Responsibility Issues</option>
                    <option value="affection">Affection Issues</option>
                    <option value="time">Time Management</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Severity Level 🚨
                  </label>
                  <select
                    value={grievanceData.severity}
                    onChange={(e) => setGrievanceData(prev => ({ ...prev, severity: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                    required
                  >
                    <option value="low">Low Severity</option>
                    <option value="medium">Medium Severity</option>
                    <option value="high">High Severity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Description 📄
                  </label>
                  <textarea
                    value={grievanceData.description}
                    onChange={(e) => setGrievanceData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the issue..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    checked={grievanceData.isAnonymous}
                    onChange={(e) => setGrievanceData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    className="rounded border-gray-300 text-romantic-pink focus:ring-romantic-pink"
                  />
                  <label htmlFor="isAnonymous" className="text-sm text-romantic-charcoal">
                    Submit anonymously
                  </label>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                  <div className="text-sm text-red-700">
                    <strong>Note:</strong> Submitting a grievance may result in credit deductions depending on the severity and resolution of the issue.
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowGrievanceModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-romantic-charcoal rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={grievanceMutation.isPending}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-romantic-lavender to-romantic-mint text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {grievanceMutation.isPending ? 'Submitting...' : 'Submit Grievance 📝'}
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

export default AccountabilityPage; 