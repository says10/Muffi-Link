import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesAPI, moodboardAPI } from '../utils/api';
import { Service, Moodboard } from '../types';
import toast from 'react-hot-toast';

interface BookingFormData {
  date: string;
  time: string;
  moodboardId?: string;
  location?: string;
  notes?: string;
}

const EnhancedServicesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    date: '',
    time: '',
    moodboardId: '',
    location: '',
    notes: ''
  });
  const queryClient = useQueryClient();

  // Fetch services
  const { data: servicesResponse, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesAPI.getServices(),
  });

  // Fetch user's moodboards for selection
  const { data: moodboardsResponse, isLoading: moodboardsLoading } = useQuery({
    queryKey: ['moodboards'],
    queryFn: () => moodboardAPI.getMoodboards(),
  });

  // Fetch user's bookings
  const { data: bookingsResponse } = useQuery({
    queryKey: ['service-bookings'],
    queryFn: () => servicesAPI.getBookings(),
  });

  // Book service mutation
  const bookServiceMutation = useMutation({
    mutationFn: ({ serviceId, bookingData }: { serviceId: string; bookingData: BookingFormData }) => 
      servicesAPI.bookService(serviceId, bookingData),
    onSuccess: (response) => {
      toast.success(response.data?.message || 'Service booked successfully! 💕');
      setShowBookingModal(false);
      setBookingForm({ date: '', time: '', moodboardId: '', location: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['service-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to book service');
    },
  });

  const services = servicesResponse?.data?.data || [];
  const moodboards = moodboardsResponse?.data?.data || [];
  const bookings = bookingsResponse?.data?.data || [];

  // Service categories
  const serviceCategories = [
    { id: 'all', name: 'All Services', icon: '💕' },
    { id: 'date', name: 'Date Ideas', icon: '🌹' },
    { id: 'gift', name: 'Thoughtful Gifts', icon: '🎁' },
    { id: 'activity', name: 'Activities', icon: '🎯' },
    { id: 'surprise', name: 'Surprises', icon: '🎉' },
    { id: 'help', name: 'Help & Support', icon: '🤝' },
    { id: 'custom', name: 'Custom', icon: '💎' },
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter((service: Service) => service.category === selectedCategory);

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = () => {
    if (!selectedService || !bookingForm.date || !bookingForm.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    bookServiceMutation.mutate({
      serviceId: selectedService._id,
      bookingData: bookingForm
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'date': return '🌹';
      case 'gift': return '🎁';
      case 'activity': return '🎯';
      case 'surprise': return '🎉';
      case 'help': return '🤝';
      case 'custom': return '💎';
      default: return '💕';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-romantic-pink via-romantic-lavender to-romantic-cream p-4 md:p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-romantic-charcoal to-romantic-pink bg-clip-text text-transparent mb-4">
            💕 Promise Services
          </h1>
          <p className="text-lg text-romantic-charcoal opacity-80 max-w-2xl mx-auto">
            Book meaningful experiences and create beautiful memories together. Each service comes with moodboard integration for the perfect ambiance!
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {serviceCategories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-romantic-pink text-white shadow-lg scale-105'
                  : 'bg-white/60 text-romantic-charcoal hover:bg-white/80 hover:scale-105'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </motion.button>
          ))}
        </div>

        {/* Services Grid */}
        {servicesLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-2xl">Loading services... 💕</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredServices.map((service: Service) => (
              <motion.div
                key={service._id}
                className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{getCategoryIcon(service.category)}</div>
                  <div className="bg-romantic-pink/20 text-romantic-pink px-3 py-1 rounded-full text-sm font-medium">
                    {service.creditCost} credits
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-romantic-charcoal mb-2">
                  {service.name}
                </h3>
                
                <p className="text-romantic-charcoal opacity-70 mb-4 line-clamp-3">
                  {service.description}
                </p>

                {service.location && (
                  <div className="flex items-center text-sm text-romantic-charcoal opacity-60 mb-2">
                    <span className="mr-2">📍</span>
                    {service.location}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm bg-romantic-lavender/30 text-romantic-charcoal px-3 py-1 rounded-full">
                    {service.category}
                  </span>
                  
                  <button
                    onClick={() => handleBookService(service)}
                    className="bg-gradient-to-r from-romantic-pink to-romantic-lavender text-white px-6 py-2 rounded-2xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Book Now 💕
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* My Bookings Section */}
        <motion.div
          className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-romantic-charcoal mb-6">My Bookings 📅</h2>
          
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-romantic-charcoal opacity-70">
              No bookings yet. Book your first service to create beautiful memories! 💕
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((booking: Service) => (
                <div
                  key={booking._id}
                  className="bg-white/40 rounded-2xl p-4 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-romantic-charcoal">{booking.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-romantic-charcoal opacity-70 space-y-1">
                    <div>📅 {new Date(booking.date).toLocaleDateString()}</div>
                    <div>⏰ {booking.time}</div>
                    {booking.location && <div>📍 {booking.location}</div>}
                    {booking.moodboard && (
                      <div className="flex items-center">
                        🎨 <span className="ml-1">{booking.moodboard.moodName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedService && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold text-romantic-charcoal mb-4">
                Book: {selectedService.name}
              </h2>

              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-romantic-pink/30 rounded-2xl focus:ring-2 focus:ring-romantic-pink/50"
                    required
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                    className="w-full p-3 border border-romantic-pink/30 rounded-2xl focus:ring-2 focus:ring-romantic-pink/50"
                    required
                  />
                </div>

                {/* Moodboard Selection */}
                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Choose Moodboard (Optional) 🎨
                  </label>
                  <select
                    value={bookingForm.moodboardId}
                    onChange={(e) => setBookingForm({ ...bookingForm, moodboardId: e.target.value })}
                    className="w-full p-3 border border-romantic-pink/30 rounded-2xl focus:ring-2 focus:ring-romantic-pink/50"
                  >
                    <option value="">No specific mood</option>
                    {moodboards.map((moodboard: Moodboard) => (
                      <option key={moodboard._id} value={moodboard._id}>
                        {moodboard.moodName} - {moodboard.theme}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-romantic-charcoal opacity-60 mt-1">
                    Select a moodboard to set the perfect ambiance for your service
                  </p>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={bookingForm.location}
                    onChange={(e) => setBookingForm({ ...bookingForm, location: e.target.value })}
                    placeholder="Enter location or leave blank for default"
                    className="w-full p-3 border border-romantic-pink/30 rounded-2xl focus:ring-2 focus:ring-romantic-pink/50"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Special Notes (Optional)
                  </label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="Any special requests or notes..."
                    rows={3}
                    className="w-full p-3 border border-romantic-pink/30 rounded-2xl focus:ring-2 focus:ring-romantic-pink/50"
                  />
                </div>

                {/* Cost */}
                <div className="bg-romantic-pink/10 rounded-2xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-romantic-charcoal">Total Cost:</span>
                    <span className="text-xl font-bold text-romantic-pink">
                      {selectedService.creditCost} Credits 💎
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 px-4 border border-romantic-pink/30 text-romantic-charcoal rounded-2xl hover:bg-romantic-pink/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitBooking}
                  disabled={bookServiceMutation.isPending}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-romantic-pink to-romantic-lavender text-white rounded-2xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {bookServiceMutation.isPending ? 'Booking...' : 'Confirm Booking 💕'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedServicesPage;
