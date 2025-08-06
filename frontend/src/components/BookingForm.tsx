import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { moodboardAPI, appointmentsAPI } from '../utils/api';
import { Service, Moodboard, ServiceCatalog } from '../types';
import toast from 'react-hot-toast';

// Type for custom services (catalog items)
interface CustomService extends Omit<ServiceCatalog, '_id'> {
  _id: string;
}

interface BookingFormProps {
  service: Service | CustomService;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ service, onClose, onSuccess }) => {
  console.log('🔍 BookingForm received service:', service);
  console.log('🔍 Service name:', service.name);
  console.log('🔍 Service description:', service.description);
  console.log('🔍 Service _id:', service._id);
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    moodboardId: '',
    location: service.location || '',
    notes: ''
  });

  // Fetch available moodboards
  const { data: moodboardsData, isLoading: moodboardsLoading } = useQuery({
    queryKey: ['moodboards'],
    queryFn: async () => {
      console.log('🔍 DEBUG: Fetching moodboards for booking form...');
      try {
        const result = await moodboardAPI.getMoodboards();
        console.log('🔍 DEBUG: Moodboards API response:', result);
        console.log('🔍 DEBUG: Moodboards data:', result?.data);
        console.log('🔍 DEBUG: Moodboards count:', result?.data?.length);
        return result;
      } catch (error) {
        console.error('🔍 DEBUG: Error fetching moodboards:', error);
        throw error;
      }
    },
  });

  // Debug moodboards data
  console.log('🔍 DEBUG: moodboardsData:', moodboardsData);
  console.log('🔍 DEBUG: moodboardsLoading:', moodboardsLoading);

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: (bookingData: any) => appointmentsAPI.createAppointment(bookingData),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to book service');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time) {
      toast.error('Please select date and time');
      return;
    }

    // Validate that we have service name for custom services
    if (service._id.startsWith('custom-') && (!service.name || service.name.trim() === '')) {
      toast.error('Custom service is missing a name. Please create the service again with a proper title.');
      return;
    }

    const bookingData = {
      serviceId: service._id,
      date: formData.date,
      time: formData.time,
      moodboardId: formData.moodboardId || undefined,
      location: formData.location,
      notes: formData.notes,
      creditCost: service.creditCost,
      // Add these for custom services - ensure we always have valid data
      serviceName: service.name || `Unnamed Service ${Date.now()}`,
      serviceDescription: service.description || 'No description provided',
      category: service.category || 'custom'
    };

    console.log('🔍 Booking data being sent:', bookingData);
    console.log('🔍 Service object:', service);
    console.log('🔍 Service object keys:', Object.keys(service));
    console.log('🔍 Service.name value:', service.name);
    console.log('🔍 Service.description value:', service.description);
    console.log('🔍 Service.name value:', service.name);
    bookingMutation.mutate(bookingData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const moodboards = moodboardsData?.data?.data || moodboardsData?.data || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-romantic-charcoal mb-2">
            Date 📅
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-romantic-charcoal mb-2">
            Time 🕒
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Moodboard Selection */}
      <div>
        <label className="block text-sm font-medium text-romantic-charcoal mb-2">
          Moodboard (Optional) 🎨
        </label>
        {moodboardsLoading ? (
          <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
            Loading moodboards...
          </div>
        ) : (
          <select
            value={formData.moodboardId}
            onChange={(e) => handleInputChange('moodboardId', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
          >
            <option value="">Select a moodboard</option>
            {Array.isArray(moodboards) && moodboards.length > 0 ? (
              moodboards.map((moodboard: Moodboard) => (
                <option key={moodboard._id} value={moodboard._id}>
                  {moodboard.moodName}
                </option>
              ))
            ) : (
              <option value="" disabled>No moodboards available</option>
            )}
          </select>
        )}
        {Array.isArray(moodboards) && moodboards.length === 0 && !moodboardsLoading && (
          <p className="text-sm text-gray-500 mt-1">No moodboards found. You can still book without one!</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-romantic-charcoal mb-2">
          Location 📍
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder={
            service.category === 'surprise' 
              ? "Where will your surprise take place? (e.g., 'That Italian restaurant downtown', 'Central Park for a picnic', 'Road trip to the beach')"
              : "Where will this take place?"
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
        />
        {service.category === 'surprise' && (
          <p className="text-xs text-romantic-charcoal opacity-70 mt-1">
            Be specific! This helps your partner understand your surprise plans.
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-romantic-charcoal mb-2">
          {service.category === 'surprise' ? 'Surprise Details 💭' : 'Special Notes 💭'}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder={
            service.category === 'surprise'
              ? "Describe your surprise! What will you do? What makes it special? Any specific activities or surprises planned?"
              : "Any special requests or details..."
          }
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent resize-none"
        />
        {service.category === 'surprise' && (
          <p className="text-xs text-romantic-charcoal opacity-70 mt-1">
            Share the excitement! Your partner will see these details when they confirm the booking.
          </p>
        )}
      </div>

      {/* Cost Summary */}
      <div className="bg-gradient-to-br from-romantic-pink/10 to-romantic-lavender/10 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-romantic-charcoal font-medium">Total Cost:</span>
          <span className="text-xl font-bold text-romantic-pink">{service.creditCost} Promise Points</span>
        </div>
        <p className="text-sm text-romantic-charcoal opacity-70 mt-1">
          Your partner will be notified to confirm this booking
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 border border-gray-300 text-romantic-charcoal rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={bookingMutation.isPending}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
        >
          {bookingMutation.isPending 
            ? 'Booking...' 
            : service.category === 'surprise' 
              ? 'Plan Surprise 💕' 
              : 'Book Service 💕'
          }
        </button>
      </div>
    </form>
  );
};

export default BookingForm; 