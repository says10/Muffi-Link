import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesAPI, moodboardAPI, appointmentsAPI } from '../utils/api';
import { Service, ServiceCatalog } from '../types';
import toast from 'react-hot-toast';
import BookingForm from '../components/BookingForm';
import { useNavigate } from 'react-router-dom';

// Type for custom services (catalog items)
interface CustomService extends Omit<ServiceCatalog, '_id'> {
  _id: string;
}

const ServicesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | CustomService | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'appointments'>('available');
  const [showSurprisesOnly, setShowSurprisesOnly] = useState(false);
  const [showCustomServiceModal, setShowCustomServiceModal] = useState(false);
  const [customServiceData, setCustomServiceData] = useState({
    name: '',
    description: '',
    duration: '',
    location: '',
    creditCost: 50
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch services
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesAPI.getServices(),
  });

  // Fetch user's appointments - DEBUG VERSION
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      console.log('🔍 DEBUG: Fetching appointments from API...');
      try {
        const result = await appointmentsAPI.getAppointments();
        console.log('🔍 DEBUG: Appointments API response:', result);
        console.log('🔍 DEBUG: Appointments data:', result?.data);
        console.log('🔍 DEBUG: Appointments count:', result?.data?.length);
        return result;
      } catch (error) {
        console.error('🔍 DEBUG: Error fetching appointments:', error);
        throw error;
      }
    },
  });

  // Debug log for appointments state
  console.log('🔍 DEBUG: appointmentsData:', appointmentsData);
  console.log('🔍 DEBUG: appointmentsLoading:', appointmentsLoading);

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
    },
    {
      _id: '3',
      name: 'Custom Surprise Planning',
      description: 'Create your own personalized surprise experience! Plan anything from a special date at your favorite restaurant to a weekend getaway to that place you always wanted to visit together.',
      category: 'surprise',
      duration: 'Custom Duration',
      location: 'Your Choice',
      creditCost: 50
    },
    {
      _id: '4',
      name: 'Special Date Surprise',
      description: 'Plan a surprise date to that specific place you know your partner loves - whether it\'s their favorite restaurant, a new hiking trail, or that museum they\'ve been wanting to visit.',
      category: 'surprise',
      duration: 'Half Day',
      location: 'Custom Location',
      creditCost: 40
    },
    {
      _id: '5',
      name: 'Adventure Surprise',
      description: 'Create an exciting surprise adventure! Plan a road trip to that place you\'ve always talked about visiting, or organize a day of activities your partner would love.',
      category: 'surprise',
      duration: 'Full Day',
      location: 'Adventure Destination',
      creditCost: 60
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

        {/* Quick Actions */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <h3 className="text-xl font-semibold text-romantic-charcoal mb-4 text-center">
              Quick Actions for Your Partner 💕
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/love-notes')}
                className="bg-gradient-to-r from-romantic-pink to-romantic-coral text-white py-4 px-6 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
              >
                💌 Send Love Note
              </button>
              <button
                onClick={() => navigate('/memories')}
                className="bg-white/30 backdrop-blur-sm text-romantic-charcoal py-4 px-6 rounded-xl font-semibold hover:bg-white/40 transition-all border border-white/30"
              >
                📸 Share Memory
              </button>
              <button
                onClick={() => {
                  setActiveTab('available');
                  setShowSurprisesOnly(true);
                }}
                className="bg-white/30 backdrop-blur-sm text-romantic-charcoal py-4 px-6 rounded-xl font-semibold hover:bg-white/40 transition-all border border-white/30"
              >
                🎁 Plan Surprise
              </button>
            </div>
            
            {/* Custom Surprise Creation */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowCustomServiceModal(true)}
                className="bg-gradient-to-r from-romantic-lavender to-romantic-mint text-white py-3 px-6 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
              >
                ✨ Create Custom Surprise
              </button>
              <p className="text-sm text-romantic-charcoal opacity-70 mt-2">
                Design your own perfect surprise experience
              </p>
            </div>
          </div>
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
                onClick={() => {
                  setActiveTab('available');
                  setShowSurprisesOnly(false);
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'available'
                    ? 'bg-romantic-pink text-white shadow-lg'
                    : 'text-romantic-charcoal hover:bg-white/20'
                }`}
              >
                Available Services
              </button>
              <button
                onClick={() => {
                  setActiveTab('appointments');
                  setShowSurprisesOnly(false);
                }}
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
            {showSurprisesOnly && (
              <motion.div
                className="col-span-full mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-gradient-to-r from-romantic-pink/20 to-romantic-lavender/20 rounded-xl p-4 border border-romantic-pink/30">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-romantic-charcoal">
                      🎁 Surprise Services
                    </h3>
                    <button
                      onClick={() => setShowSurprisesOnly(false)}
                      className="text-romantic-charcoal hover:text-romantic-pink transition-colors"
                    >
                      Show All Services
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {!showSurprisesOnly && (
              <motion.div
                className="col-span-full mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-romantic-charcoal">
                      💕 All Available Services
                    </h3>
                    <button
                      onClick={() => setShowSurprisesOnly(true)}
                      className="text-romantic-charcoal hover:text-romantic-pink transition-colors"
                    >
                      Show Surprises Only
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {services
              .filter((service: any) => !showSurprisesOnly || service.category === 'surprise')
              .map((service: any, index: number) => (
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
                  <span className="text-4xl">
                    {service.category === 'surprise' ? '🎁' : 
                     service.category === 'dates' ? '💕' : 
                     service.category === 'experiences' ? '🌟' : '💕'}
                  </span>
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
                
                <button 
                  onClick={() => {
                    setSelectedService(service);
                    setShowBookingModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all"
                >
                  Make Promise 💕
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (() => {
          // Debug info
          console.log('🔍 DEBUG: Rendering appointments tab');
          console.log('🔍 DEBUG: appointmentsLoading:', appointmentsLoading);
          console.log('🔍 DEBUG: appointmentsData:', appointmentsData);
          console.log('🔍 DEBUG: appointmentsData?.data:', appointmentsData?.data);
          console.log('🔍 DEBUG: Is array?', Array.isArray(appointmentsData?.data));
          console.log('🔍 DEBUG: Array length:', appointmentsData?.data?.length);
          
          return (
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
                (() => {
                  console.log('🔍 DEBUG: Rendering appointments list with', appointmentsData.data.length, 'items');
                  return (
                    <div className="grid gap-6">
                      {appointmentsData.data.map((appointment: any) => {
                        console.log('🔍 DEBUG: Rendering appointment:', appointment);
                        return (
                          <motion.div
                      key={appointment._id}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <h3 className="text-xl font-semibold text-romantic-charcoal mb-2">
                        {appointment.serviceId?.name || appointment.name}
                      </h3>
                      <p className="text-romantic-charcoal opacity-70 text-sm mb-4">
                        {appointment.serviceId?.description || appointment.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-romantic-charcoal opacity-70">
                          {appointment.date && appointment.time 
                            ? `${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}`
                            : 'Date/Time TBD'
                          }
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {appointment.status || 'pending'}
                        </span>
                      </div>
                    </motion.div>
                  );
                        })}
                      </div>
                    );
                  })()
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
            );
          })()}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedService && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-romantic-charcoal">
                  {selectedService.category === 'surprise' ? 'Plan Surprise' : 'Book Service'}
                </h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-romantic-charcoal hover:text-romantic-pink transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Service Details */}
                <div className="bg-gradient-to-br from-romantic-pink/10 to-romantic-lavender/10 rounded-lg p-4">
                  <h3 className="font-semibold text-romantic-charcoal mb-2">{selectedService.name}</h3>
                  <p className="text-sm text-romantic-charcoal opacity-70">{selectedService.description}</p>
                  <div className="mt-3 flex justify-between text-sm">
                    <span>Cost: <span className="font-semibold text-romantic-pink">{selectedService.creditCost} points</span></span>
                    <span>Duration: {selectedService.duration}</span>
                  </div>
                  {selectedService._id?.startsWith('custom-') && (
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-romantic-lavender/20 text-romantic-lavender rounded-full text-xs font-medium">
                        ✨ Custom Surprise
                      </span>
                    </div>
                  )}
                </div>

                {/* Booking Form */}
                <BookingForm 
                  service={selectedService}
                  onClose={() => setShowBookingModal(false)}
                  onSuccess={() => {
                    setShowBookingModal(false);
                    setSelectedService(null);
                    queryClient.invalidateQueries({ queryKey: ['appointments'] });
                    toast.success(
                      selectedService.category === 'surprise' 
                        ? selectedService._id?.startsWith('custom-')
                          ? 'Custom surprise created and planned! Your partner will be amazed! ✨'
                          : 'Surprise planned successfully! Your partner will be excited! 🎁' 
                        : 'Service booked successfully! 💕'
                    );
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Service Creation Modal */}
      <AnimatePresence>
        {showCustomServiceModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCustomServiceModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-romantic-charcoal">Create Custom Surprise</h2>
                <button
                  onClick={() => setShowCustomServiceModal(false)}
                  className="text-romantic-charcoal hover:text-romantic-pink transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                
                console.log('🔍 Creating custom service with data:', customServiceData);
                console.log('🔍 Raw form data:');
                console.log('  - name:', `"${customServiceData.name}"`);
                console.log('  - description:', `"${customServiceData.description}"`);
                console.log('  - name length:', customServiceData.name.length);
                console.log('  - description length:', customServiceData.description.length);
                
                // Validate required fields
                if (!customServiceData.name.trim()) {
                  toast.error('Please enter a service name in the "Surprise Title" field');
                  return;
                }
                if (!customServiceData.description.trim()) {
                  toast.error('Please enter a service description');
                  return;
                }
                
                // Create a custom service object
                const customService: CustomService = {
                  _id: `custom-${Date.now()}`,
                  name: customServiceData.name.trim(),
                  description: customServiceData.description.trim(),
                  category: 'surprise',
                  duration: customServiceData.duration || '1 hour',
                  location: customServiceData.location || 'Custom location',
                  creditCost: customServiceData.creditCost,
                  isCustom: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                
                console.log('🔍 Created custom service object:', customService);
                console.log('🔍 Custom service name:', customService.name);
                console.log('🔍 Custom service description:', customService.description);
                
                // Set as selected service and open booking modal
                setSelectedService(customService);
                setShowCustomServiceModal(false);
                setShowBookingModal(true);
                
                // Reset form
                setCustomServiceData({
                  name: '',
                  description: '',
                  duration: '',
                  location: '',
                  creditCost: 50
                });
              }} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Surprise Title ✨
                  </label>
                  <input
                    type="text"
                    value={customServiceData.name}
                    onChange={(e) => setCustomServiceData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Give your surprise a creative name..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Description 💭
                  </label>
                  <textarea
                    value={customServiceData.description}
                    onChange={(e) => setCustomServiceData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what your surprise will involve..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                      Duration ⏰
                    </label>
                    <input
                      type="text"
                      value={customServiceData.duration}
                      onChange={(e) => setCustomServiceData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 2 hours, Full day"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                      Promise Points 💎
                    </label>
                    <input
                      type="number"
                      value={customServiceData.creditCost}
                      onChange={(e) => setCustomServiceData(prev => ({ ...prev, creditCost: parseInt(e.target.value) || 50 }))}
                      min="10"
                      max="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Location 📍
                  </label>
                  <input
                    type="text"
                    value={customServiceData.location}
                    onChange={(e) => setCustomServiceData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Where will this surprise take place?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCustomServiceModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-romantic-charcoal rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-romantic-lavender to-romantic-mint text-white font-semibold rounded-lg hover:opacity-90 transition-all"
                  >
                    Create & Plan Surprise ✨
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

export default ServicesPage;