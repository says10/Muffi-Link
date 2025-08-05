import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesAPI, moodboardAPI } from '../utils/api';
import { Service } from '../types';
import toast from 'react-hot-toast';

const ServicesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'appointments'>('available');
  const queryClient = useQueryClient();

  // Fetch services
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesAPI.getServices(),
  });

  // Fetch user's appointments
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['service-bookings'],
    queryFn: () => servicesAPI.getBookings(),
  });

  // Mock services data
  const mockServices = [
    {
      _id: '1',
      name: 'Romantic Dinner at Home',
      description: 'Cook a special 3-course meal together with candlelight ambiance',
      category: 'dates',
      duration: '3 hours',
      location: 'At Home',
      creditCost: 25
    },
    {
      _id: '2',
      name: 'Weekend Getaway Planning', 
      description: 'Plan and execute a surprise weekend trip to a romantic destination',
      category: 'experiences',
      duration: '2 days',
      location: 'Nearby City',
      creditCost: 75
    }
  ];

  const servicesArray = servicesData?.data?.data || mockServices || [];
  const services = Array.isArray(servicesArray) ? servicesArray : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-romantic-charcoal">Loading promise services... 💕</p>
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
            Promise Services 💕
          </h1>
          <p className="text-lg text-romantic-charcoal opacity-70 max-w-2xl mx-auto">
            Turn your love into action! Choose from thoughtful services and create meaningful promises.
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
                onClick={() => setActiveTab('available')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'available'
                    ? 'bg-romantic-pink text-white shadow-lg'
                    : 'text-romantic-charcoal hover:bg-white/20'
                }`}
              >
                Available Services
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'appointments'
                    ? 'bg-romantic-pink text-white shadow-lg'
                    : 'text-romantic-charcoal hover:bg-white/20'
                }`}
              >
                My Appointments
                {appointmentsData?.data?.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-white/30 rounded-full text-xs">
                    {appointmentsData?.data?.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Available Services Tab */}
        {activeTab === 'available' && (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {services.map((service: any, index: number) => (
              <motion.div
                key={service._id}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-full h-48 bg-gradient-to-br from-romantic-pink/20 to-romantic-lavender/20 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">💕</span>
                </div>
                
                <h3 className="text-xl font-semibold text-romantic-charcoal mb-2">
                  {service.name}
                </h3>
                
                <p className="text-romantic-charcoal opacity-70 text-sm mb-4">
                  {service.description}
                </p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-romantic-charcoal opacity-70">Duration:</span>
                    <span className="font-medium">{service.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-romantic-charcoal opacity-70">Location:</span>
                    <span className="font-medium">{service.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-romantic-charcoal opacity-70">Promise Points:</span>
                    <span className="font-semibold text-romantic-pink">
                      {service.creditCost} points
                    </span>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all">
                  Make Promise 💕
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {appointmentsLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-romantic-charcoal">Loading your appointments... 💕</p>
              </div>
            ) : appointmentsData?.data && Array.isArray(appointmentsData.data) && appointmentsData.data.length > 0 ? (
              <div className="grid gap-6">
                {appointmentsData.data.map((appointment: Service) => (
                  <motion.div
                    key={appointment._id}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <h3 className="text-xl font-semibold text-romantic-charcoal mb-2">
                      {appointment.name}
                    </h3>
                    <p className="text-romantic-charcoal opacity-70 text-sm mb-4">
                      {appointment.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-romantic-charcoal opacity-70">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {appointment.status || 'pending'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-romantic-charcoal mb-2">No appointments yet</h3>
                <p className="text-romantic-charcoal opacity-70 mb-6">Book your first romantic service to get started!</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-6 py-3 bg-romantic-pink text-white rounded-xl hover:bg-romantic-coral transition-colors"
                >
                  Browse Available Services 💕
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;