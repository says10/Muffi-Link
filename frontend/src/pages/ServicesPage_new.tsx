import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesAPI } from '../utils/api';
import { Service } from '../types';
import toast from 'react-hot-toast';

const ServicesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({ date: '', time: '', customMessage: '' });
  const queryClient = useQueryClient();

  // Fetch services
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesAPI.getServices(),
  });

  // Book service mutation - creates promise commitment
  const bookServiceMutation = useMutation({
    mutationFn: (data: { serviceId: string; date: string; time: string; message?: string }) => 
      servicesAPI.bookService(data.serviceId, {
        date: data.date,
        time: data.time,
        notes: data.message
      }),
    onSuccess: () => {
      toast.success('Promise commitment sent to your partner! 💕');
      setShowBookingModal(false);
      setShowConfirmationModal(true);
      queryClient.invalidateQueries({ queryKey: ['service-bookings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create promise commitment');
    },
  });

  // Service categories focused on relationship activities
  const serviceCategories = [
    { id: 'all', name: 'All Services', icon: '💕' },
    { id: 'dates', name: 'Date Ideas', icon: '🌹' },
    { id: 'experiences', name: 'Experiences', icon: '✨' },
    { id: 'gifts', name: 'Thoughtful Gifts', icon: '🎁' },
    { id: 'quality-time', name: 'Quality Time', icon: '👫' },
    { id: 'surprises', name: 'Surprises', icon: '🎉' },
    { id: 'custom', name: 'Custom Requests', icon: '💎' },
  ];

  // Mock services data focused on relationship activities
  const mockServices = [
    {
      _id: '1',
      name: 'Romantic Dinner at Home',
      description: 'Cook a special 3-course meal together with candlelight ambiance',
      image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500',
      duration: '3 hours',
      location: 'At Home',
      price: 25,
      category: 'dates',
      promisePoints: 25,
      difficultyLevel: 'Easy',
      preparationTime: '2 hours',
      requirements: ['Cooking ingredients', 'Candles', 'Nice playlist']
    },
    {
      _id: '2',
      name: 'Weekend Getaway Planning',
      description: 'Plan and execute a surprise weekend trip to a romantic destination',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
      duration: '2 days',
      location: 'Nearby City',
      price: 75,
      category: 'experiences',
      promisePoints: 75,
      difficultyLevel: 'Hard',
      preparationTime: '1 week',
      requirements: ['Travel arrangements', 'Accommodation booking', 'Activity planning']
    },
    {
      _id: '3',
      name: 'Memory Scrapbook Creation',
      description: 'Create a beautiful scrapbook of your relationship memories together',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500',
      duration: '4 hours',
      location: 'At Home',
      price: 20,
      category: 'gifts',
      promisePoints: 20,
      difficultyLevel: 'Medium',
      preparationTime: '3 days',
      requirements: ['Photos', 'Scrapbook materials', 'Decorative items']
    },
    {
      _id: '4',
      name: 'Movie Marathon Night',
      description: 'Curate a special movie night with favorite films, snacks, and cozy setup',
      image: 'https://images.unsplash.com/photo-1489599807473-d527c3d2b14d?w=500',
      duration: '5 hours',
      location: 'At Home',
      price: 15,
      category: 'quality-time',
      promisePoints: 15,
      difficultyLevel: 'Easy',
      preparationTime: '1 day',
      requirements: ['Movie selection', 'Snacks', 'Cozy setup']
    },
    {
      _id: '5',
      name: 'Surprise Picnic Setup',
      description: 'Organize a surprise outdoor picnic with favorite foods and activities',
      image: 'https://images.unsplash.com/photo-1506368083636-6defb67639a7?w=500',
      duration: '4 hours',
      location: 'Local Park',
      price: 30,
      category: 'surprises',
      promisePoints: 30,
      difficultyLevel: 'Medium',
      preparationTime: '2 days',
      requirements: ['Picnic supplies', 'Food preparation', 'Activities planning']
    },
    {
      _id: '6',
      name: 'Custom Romantic Gesture',
      description: 'Design and execute a personalized romantic gesture tailored to your partner',
      image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500',
      duration: 'Variable',
      location: 'Variable',
      price: 50,
      category: 'custom',
      promisePoints: 50,
      difficultyLevel: 'Variable',
      preparationTime: 'Variable',
      requirements: ['Custom planning', 'Personal touches', 'Creativity']
    }
  ];

  const services = servicesData?.data || mockServices;
  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter((service: any) => service.category === selectedCategory);

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (selectedService && bookingDetails.date && bookingDetails.time) {
      bookServiceMutation.mutate({
        serviceId: selectedService._id,
        date: bookingDetails.date,
        time: bookingDetails.time,
        message: bookingDetails.customMessage
      });
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-romantic-charcoal">Loading romantic services... 💕</p>
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
              Promise Services 💝
            </span>
          </h1>
          <p className="text-romantic-charcoal opacity-70 text-lg">
            Make romantic commitments and build trust through shared experiences
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {serviceCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-romantic-pink text-white shadow-lg'
                  : 'bg-white/30 text-romantic-charcoal hover:bg-white/40'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {filteredServices.map((service: any, index: number) => (
            <motion.div
              key={service._id}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleBookService(service)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              
              <h3 className="text-lg font-semibold text-romantic-charcoal mb-2">
                {service.name}
              </h3>
              
              <p className="text-romantic-charcoal opacity-70 text-sm mb-4 line-clamp-2">
                {service.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-romantic-charcoal opacity-70">Duration:</span>
                  <span className="text-sm font-medium">{service.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-romantic-charcoal opacity-70">Difficulty:</span>
                  <span className="text-sm font-medium">{service.difficultyLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-romantic-charcoal opacity-70">Promise Points:</span>
                  <span className="text-sm font-semibold text-romantic-pink">{service.promisePoints} points</span>
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                Make Promise Commitment
              </button>
            </motion.div>
          ))}
        </motion.div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💔</div>
            <h3 className="text-lg font-medium text-romantic-charcoal mb-2">No services found</h3>
            <p className="text-romantic-charcoal opacity-70">Try selecting a different category</p>
          </div>
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
              className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-2xl font-semibold text-romantic-charcoal mb-6">
                Create Promise Commitment
              </h2>
              
              <div className="mb-6">
                <div className="w-full h-32 bg-gradient-to-br from-romantic-pink/20 to-romantic-lavender/20 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">💕</span>
                </div>
                <h3 className="text-lg font-semibold text-romantic-charcoal mb-2">
                  {selectedService.name}
                </h3>
                <p className="text-romantic-charcoal opacity-70 text-sm mb-4">
                  {selectedService.description}
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
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
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Commitment Date *
                  </label>
                  <input
                    type="date"
                    value={bookingDetails.date}
                    onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Preferred Time *
                  </label>
                  <input
                    type="time"
                    value={bookingDetails.time}
                    onChange={(e) => setBookingDetails({...bookingDetails, time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Special Message (Optional)
                  </label>
                  <textarea
                    value={bookingDetails.customMessage}
                    onChange={(e) => setBookingDetails({...bookingDetails, customMessage: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent resize-none"
                    placeholder="Add a romantic message for your partner..."
                  />
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Promise Commitment:</strong> By booking this service, you commit to completing it on the specified date. 
                  Your partner will be notified to confirm. Breaking this commitment will result in point penalties.
                </p>
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
                  {bookServiceMutation.isPending ? 'Creating...' : 'Make Promise'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmationModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-6xl mb-4">💕</div>
              <h2 className="text-2xl font-semibold text-romantic-charcoal mb-4">
                Promise Commitment Sent!
              </h2>
              <p className="text-romantic-charcoal opacity-70 mb-6">
                Your partner has been notified and will confirm the commitment. 
                You'll both receive reminders as the date approaches.
              </p>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="w-full bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServicesPage;
