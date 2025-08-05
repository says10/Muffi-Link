import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesAPI, appointmentsAPI } from '../utils/api';
import { Service } from '../types';
import toast from 'react-hot-toast';

const ServicesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const queryClient = useQueryClient();

  // Fetch available services
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesAPI.getServices(),
  });

  // Fetch user's bookings/appointments
  const { data: bookingsData, error: bookingsError } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentsAPI.getAppointments(),
  });

  // Book service mutation
  const bookServiceMutation = useMutation({
    mutationFn: (serviceId: string) => servicesAPI.bookService(serviceId, {
      date: new Date().toISOString().split('T')[0],
      time: '12:00'
    }),
    onSuccess: () => {
      toast.success('Service booked successfully! 💕');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowBookingModal(false);
      setSelectedService(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to book service');
    },
  });

  const serviceCategories = [
    { id: 'all', name: 'All Services', icon: '🎯' },
    { id: 'romantic', name: 'Romantic Dates', icon: '💕' },
    { id: 'adventure', name: 'Adventures', icon: '🌟' },
    { id: 'relaxation', name: 'Relaxation', icon: '🧘‍♀️' },
    { id: 'dining', name: 'Dining', icon: '🍽️' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎭' },
  ];

  const mockServices = [
    {
      _id: '1',
      name: 'Romantic Candlelight Dinner',
      description: 'Intimate dinner for two with candlelight, live music, and a romantic atmosphere',
      category: 'romantic',
      price: 150,
      image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
      duration: '3 hours',
      provider: 'RomanceHub',
      rating: 4.8,
      location: 'Downtown Restaurant'
    },
    {
      _id: '2',
      name: 'Couple\'s Spa Day',
      description: 'Relaxing spa experience with couple\'s massage and wellness treatments',
      category: 'relaxation',
      price: 200,
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
      duration: '4 hours',
      provider: 'BlissSpa',
      rating: 4.9,
      location: 'Luxury Spa Resort'
    },
    {
      _id: '3',
      name: 'Hot Air Balloon Ride',
      description: 'Breathtaking hot air balloon adventure with champagne and stunning views',
      category: 'adventure',
      price: 300,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      duration: '2 hours',
      provider: 'SkyAdventures',
      rating: 4.7,
      location: 'Valley View Park'
    },
    {
      _id: '4',
      name: 'Private Movie Screening',
      description: 'Exclusive private cinema experience with your favorite movies and snacks',
      category: 'entertainment',
      price: 120,
      image: 'https://images.unsplash.com/photo-1489599796615-2ec6b1d5ad34?w=400',
      duration: '3 hours',
      provider: 'CinemaLux',
      rating: 4.6,
      location: 'Premium Theater'
    },
    {
      _id: '5',
      name: 'Wine Tasting Experience',
      description: 'Guided wine tasting with premium wines and gourmet cheese pairings',
      category: 'dining',
      price: 180,
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
      duration: '2.5 hours',
      provider: 'VintageVines',
      rating: 4.8,
      location: 'Historic Winery'
    },
    {
      _id: '6',
      name: 'Sunset Beach Walk',
      description: 'Romantic beach walk during sunset with photography session included',
      category: 'romantic',
      price: 80,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      duration: '2 hours',
      provider: 'SunsetMoments',
      rating: 4.5,
      location: 'Crystal Beach'
    }
  ];

  const services = servicesData?.data || mockServices;
  const bookings = bookingsData?.data?.data || [];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter((service: any) => service.category === selectedCategory);

  const handleBookService = (service: any) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (selectedService) {
      bookServiceMutation.mutate(selectedService._id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-romantic-charcoal">Loading services... 💕</p>
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
              Romantic Services 💕
            </span>
          </h1>
          <p className="text-romantic-charcoal opacity-70 text-lg">
            Book unforgettable experiences for you and your partner
          </p>
        </motion.div>

        {/* Your Bookings Summary */}
        {bookings.length > 0 && (
          <motion.div
            className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-romantic-charcoal mb-4">Your Recent Bookings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.slice(0, 3).map((appointment: any, index: number) => (
                <div key={index} className="bg-white/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-romantic-charcoal">{appointment.serviceName}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {appointment.status === 'pending' ? 'Awaiting Partner Confirmation' : 
                       appointment.status === 'confirmed' ? 'Confirmed' :
                       appointment.status === 'cancelled' ? 'Cancelled' :
                       appointment.status}
                    </span>
                  </div>
                  <p className="text-sm text-romantic-charcoal opacity-70">
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                  </p>
                  <p className="text-sm text-romantic-charcoal opacity-60">{appointment.location}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Category Filter */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {serviceCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-romantic-pink to-romantic-coral text-white shadow-lg'
                    : 'bg-white/20 backdrop-blur-sm text-romantic-charcoal hover:bg-white/30'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <AnimatePresence>
            {filteredServices.map((service: any, index: number) => (
              <motion.div
                key={service._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-sm font-semibold text-romantic-charcoal">
                      ${service.price}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center space-x-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-white font-medium">{service.rating}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-romantic-charcoal mb-2">
                    {service.name}
                  </h3>
                  <p className="text-romantic-charcoal opacity-70 mb-4 text-sm">
                    {service.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-romantic-charcoal opacity-80">
                      <span className="mr-2">⏱️</span>
                      {service.duration}
                    </div>
                    <div className="flex items-center text-sm text-romantic-charcoal opacity-80">
                      <span className="mr-2">�</span>
                      {service.location}
                    </div>
                    <div className="flex items-center text-sm text-romantic-charcoal opacity-80">
                      <span className="mr-2">🏢</span>
                      {service.provider}
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookService(service)}
                    className="w-full bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-300 hover:scale-105"
                  >
                    Book Now �💕
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredServices.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-romantic-charcoal mb-2">
              No services found
            </h3>
            <p className="text-romantic-charcoal opacity-70">
              Try selecting a different category
            </p>
          </motion.div>
        )}
      </div>

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
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-2xl font-semibold text-romantic-charcoal mb-4">
                Confirm Booking
              </h2>
              
              <div className="mb-6">
                <div className="w-full h-32 bg-gradient-to-br from-romantic-pink/20 to-romantic-lavender/20 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">💕</span>
                </div>
                <h3 className="text-lg font-medium text-romantic-charcoal mb-2">
                  {selectedService.name}
                </h3>
                <p className="text-romantic-charcoal opacity-70 text-sm mb-4">
                  {selectedService.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-romantic-charcoal opacity-70">Category:</span>
                    <span className="font-medium">{selectedService.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-romantic-charcoal opacity-70">Location:</span>
                    <span className="font-medium">{selectedService.location || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-romantic-charcoal opacity-70">Credits:</span>
                    <span className="font-semibold text-romantic-pink">{selectedService.creditCost || 0} credits</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  disabled={bookServiceMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {bookServiceMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServicesPage;
