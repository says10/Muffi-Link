import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  // Fetch user's appointments
  const { data: appointmentsData, error: appointmentsError, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentsAPI.getAppointments(),
  });

  // Debug logging for appointments data
  useEffect(() => {
    if (appointmentsData) {
      console.log('🔍 Frontend DEBUG: Appointments API response:', appointmentsData);
      console.log('🔍 Frontend DEBUG: Appointments data structure:', JSON.stringify(appointmentsData, null, 2));
    }
    if (appointmentsError) {
      console.error('🔍 Frontend DEBUG: Appointments API error:', appointmentsError);
    }
  }, [appointmentsData, appointmentsError]);

  const appointments = appointmentsData?.data?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-romantic-charcoal">Loading appointments... 💕</p>
        </div>
      </div>
    );
  }

  if (appointmentsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-romantic-charcoal mb-2">
            Error loading appointments
          </h3>
          <p className="text-romantic-charcoal opacity-70">
            Check the console for more details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-romantic-peach/30 via-romantic-lavender/20 to-romantic-mint/30">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-romantic mb-4">
            <span className="bg-gradient-to-r from-romantic-pink to-romantic-coral bg-clip-text text-transparent">
              My Appointments 💕
            </span>
          </h1>
          <p className="text-romantic-charcoal opacity-70 text-lg">
            Manage your romantic experiences and bookings
          </p>
        </motion.div>

        {/* Appointments List */}
        {appointments.length > 0 ? (
          <motion.div
            className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-romantic-charcoal mb-4">
              Your Appointments ({appointments.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments.map((appointment: any, index: number) => (
                <motion.div
                  key={appointment._id || index}
                  className="bg-white/30 rounded-lg p-4 hover:bg-white/40 transition-colors cursor-pointer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/appointments/${appointment._id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-romantic-charcoal">
                      {appointment.serviceName || 'Unknown Service'}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {appointment.status === 'pending' ? 'Awaiting Partner Confirmation' : 
                       appointment.status === 'confirmed' ? 'Confirmed' :
                       appointment.status === 'cancelled' ? 'Cancelled' :
                       appointment.status || 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-romantic-charcoal opacity-70">
                    <p>
                      <strong>Date:</strong> {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'No date'}
                    </p>
                    <p>
                      <strong>Time:</strong> {appointment.time || 'No time'}
                    </p>
                    <p>
                      <strong>Location:</strong> {appointment.location || 'No location'}
                    </p>
                    <p>
                      <strong>Category:</strong> {appointment.category || 'No category'}
                    </p>
                    <p>
                      <strong>Credits:</strong> {appointment.creditCost || 0}
                    </p>
                    {appointment.description && (
                      <p>
                        <strong>Description:</strong> {appointment.description}
                      </p>
                    )}
                    {appointment.notes && (
                      <p>
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    )}
                  </div>

                  {/* Remove the raw appointment data debug section */}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-romantic-charcoal mb-2">
              No appointments found
            </h3>
            <p className="text-romantic-charcoal opacity-70">
              You haven't booked any romantic experiences yet
            </p>
            <button
              onClick={() => window.location.href = '/services'}
              className="mt-4 bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-300"
            >
              Browse Services 💕
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
