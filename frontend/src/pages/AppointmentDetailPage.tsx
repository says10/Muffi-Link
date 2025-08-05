import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const AppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'decline' | 'delete' | null>(null);

  // Fetch appointment details
  const { data: appointmentData, isLoading: isLoadingAppointment, error } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentsAPI.getAppointment(id!),
    enabled: !!id,
  });

  // Accept appointment mutation (for partner)
  const acceptMutation = useMutation({
    mutationFn: () => appointmentsAPI.acceptAppointment(id!),
    onSuccess: () => {
      toast.success('Appointment accepted! 💕');
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowConfirmModal(false);
      setActionType(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to accept appointment');
    },
  });

  // Decline appointment mutation (for partner)
  const declineMutation = useMutation({
    mutationFn: () => appointmentsAPI.declineAppointment(id!),
    onSuccess: () => {
      toast.success('Appointment declined');
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowConfirmModal(false);
      setActionType(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to decline appointment');
    },
  });

  // Delete appointment mutation (for creator)
  const deleteMutation = useMutation({
    mutationFn: () => appointmentsAPI.deleteAppointment(id!),
    onSuccess: () => {
      toast.success('Appointment cancelled and credits refunded!');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      navigate('/appointments');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete appointment');
    },
  });

  const handleAction = (action: 'accept' | 'decline' | 'delete') => {
    setActionType(action);
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    if (actionType === 'accept') {
      acceptMutation.mutate();
    } else if (actionType === 'decline') {
      declineMutation.mutate();
    } else if (actionType === 'delete') {
      deleteMutation.mutate();
    }
  };

  if (isLoading || isLoadingAppointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-romantic-charcoal">Loading appointment details... 💕</p>
        </div>
      </div>
    );
  }

  if (error || !appointmentData?.data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-romantic-charcoal mb-2">
            Appointment not found
          </h3>
          <p className="text-romantic-charcoal opacity-70 mb-4">
            This appointment may have been deleted or you don't have permission to view it.
          </p>
          <button
            onClick={() => navigate('/appointments')}
            className="bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-300"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  const appointment = appointmentData.data.data;
  const moodboard = appointment.moodboardId;

  // Determine user role and permissions
  const isCreator = user && user._id && (appointment.userId._id || appointment.userId) && 
    user._id.toString() === (appointment.userId._id || appointment.userId).toString();
  const isPartner = user && user._id && (appointment.partnerId._id || appointment.partnerId) && 
    user._id.toString() === (appointment.partnerId._id || appointment.partnerId).toString();
  const canDelete = isCreator; // Allow creator to cancel in any status
  const canAcceptDecline = isPartner && !isCreator && appointment.status === 'pending';

  return (
    <div className="min-h-screen bg-gradient-to-br from-romantic-peach/30 via-romantic-lavender/20 to-romantic-mint/30">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => navigate('/appointments')}
            className="flex items-center text-romantic-charcoal hover:text-romantic-pink transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Appointments
          </button>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {appointment.status === 'pending' ? 'Awaiting Response' : 
             appointment.status === 'confirmed' ? 'Confirmed' :
             appointment.status === 'cancelled' ? 'Declined' :
             appointment.status}
          </span>
        </motion.div>

        {/* Action Buttons */}
        {(canDelete || canAcceptDecline) && (
          <motion.div
            className="flex gap-4 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Delete button for creator */}
            {canDelete && (
              <button
                onClick={() => handleAction('delete')}
                className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
            )}

            {/* Accept/Decline buttons for partner */}
            {canAcceptDecline && (
              <>
                <button
                  onClick={() => handleAction('decline')}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  disabled={declineMutation.isPending || acceptMutation.isPending}
                >
                  {declineMutation.isPending ? 'Declining...' : 'Decline'}
                </button>
                
                <button
                  onClick={() => handleAction('accept')}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  disabled={acceptMutation.isPending || declineMutation.isPending}
                >
                  {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
                </button>
              </>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Details */}
          <motion.div
            className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-romantic-charcoal mb-6">
              {appointment.serviceName} 💕
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-romantic-charcoal opacity-70">Description</label>
                <p className="text-romantic-charcoal mt-1">{appointment.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-romantic-charcoal opacity-70">Date</label>
                  <p className="text-romantic-charcoal mt-1">
                    {new Date(appointment.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-romantic-charcoal opacity-70">Time</label>
                  <p className="text-romantic-charcoal mt-1">{appointment.time}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-romantic-charcoal opacity-70">Location</label>
                <p className="text-romantic-charcoal mt-1">{appointment.location}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-romantic-charcoal opacity-70">Category</label>
                <p className="text-romantic-charcoal mt-1 capitalize">{appointment.category}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-romantic-charcoal opacity-70">Credits Required</label>
                <p className="text-romantic-pink font-semibold mt-1">{appointment.creditCost} credits</p>
              </div>
              
              {appointment.notes && (
                <div>
                  <label className="text-sm font-medium text-romantic-charcoal opacity-70">Special Notes</label>
                  <p className="text-romantic-charcoal mt-1 bg-white/10 p-3 rounded-lg">{appointment.notes}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Moodboard Details */}
          <motion.div
            className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-romantic-charcoal mb-6">
              Moodboard Details 🎨
            </h2>
            
            {moodboard ? (
              <div className="space-y-4">
                {moodboard.imageUrl && (
                  <div className="w-full h-48 rounded-lg overflow-hidden">
                    <img
                      src={moodboard.imageUrl}
                      alt={moodboard.moodName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-romantic-charcoal opacity-70">Mood Name</label>
                  <p className="text-romantic-charcoal mt-1 font-semibold">{moodboard.moodName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-romantic-charcoal opacity-70">Theme</label>
                  <p className="text-romantic-charcoal mt-1">{moodboard.theme}</p>
                </div>
                
                {moodboard.description && (
                  <div>
                    <label className="text-sm font-medium text-romantic-charcoal opacity-70">Description</label>
                    <p className="text-romantic-charcoal mt-1">{moodboard.description}</p>
                  </div>
                )}
                
                {moodboard.colors && moodboard.colors.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-romantic-charcoal opacity-70">Colors</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {moodboard.colors.map((color: string, index: number) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded-full border-2 border-white/30"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {moodboard.tags && moodboard.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-romantic-charcoal opacity-70">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {moodboard.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-romantic-pink/20 text-romantic-pink rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎨</div>
                <p className="text-romantic-charcoal opacity-70">No moodboard attached to this appointment</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Status Messages */}
        {appointment.status === 'confirmed' && (
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-green-800 font-semibold">This appointment has been confirmed!</p>
              <p className="text-green-600 text-sm mt-1">Enjoy your romantic experience together 💕</p>
            </div>
          </motion.div>
        )}

        {appointment.status === 'cancelled' && (
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="text-4xl mb-2">❌</div>
              <p className="text-red-800 font-semibold">This appointment has been declined</p>
              <p className="text-red-600 text-sm mt-1">You can always plan something else together</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-2xl font-semibold text-romantic-charcoal mb-4">
                {actionType === 'accept' ? 'Accept Appointment?' : 
                 actionType === 'decline' ? 'Decline Appointment?' :
                 'Cancel Appointment?'}
              </h2>
              
              <p className="text-romantic-charcoal opacity-70 mb-6">
                {actionType === 'accept' 
                  ? 'Are you sure you want to accept this romantic appointment? This action cannot be undone.'
                  : actionType === 'decline'
                  ? 'Are you sure you want to decline this appointment? Your partner will be notified and credits will be refunded.'
                  : 'Are you sure you want to cancel this appointment? Credits will be refunded to your account.'
                }
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={acceptMutation.isPending || declineMutation.isPending || deleteMutation.isPending}
                  className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 ${
                    actionType === 'accept'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : actionType === 'decline'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {actionType === 'accept' 
                    ? (acceptMutation.isPending ? 'Accepting...' : 'Yes, Accept 💕')
                    : actionType === 'decline'
                    ? (declineMutation.isPending ? 'Declining...' : 'Yes, Decline')
                    : (deleteMutation.isPending ? 'Cancelling...' : 'Yes, Cancel')
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentDetailPage;
