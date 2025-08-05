import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { grievancesAPI } from '../utils/api';
import { Grievance } from '../types';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface GrievanceFormData {
  subject: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  requestedAction: string;
}

const GrievancesPage: React.FC = () => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GrievanceFormData>();

  // Fetch grievances
  const { data: grievancesData, isLoading } = useQuery({
    queryKey: ['grievances'],
    queryFn: () => grievancesAPI.getGrievances(),
  });

  // Submit grievance mutation
  const submitGrievanceMutation = useMutation({
    mutationFn: (data: GrievanceFormData) => grievancesAPI.createGrievance(data),
    onSuccess: () => {
      toast.success('Accountability report submitted! Your partner will be notified. 💔');
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      setShowSubmitModal(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit report');
    },
  });

  const grievanceCategories = [
    { id: 'broken-promise', name: 'Broken Promise', icon: '💔', creditPenalty: 15 },
    { id: 'poor-effort', name: 'Poor Effort', icon: '😞', creditPenalty: 10 },
    { id: 'no-show', name: 'No Show', icon: '👻', creditPenalty: 25 },
    { id: 'late-cancellation', name: 'Last Minute Cancellation', icon: '⏰', creditPenalty: 20 },
    { id: 'attitude', name: 'Poor Attitude', icon: '😤', creditPenalty: 12 },
    { id: 'communication', name: 'Communication Issues', icon: '🗣️', creditPenalty: 8 },
    { id: 'other', name: 'Other Issues', icon: '⚠️', creditPenalty: 5 },
  ];

  const mockGrievances = [
    {
      _id: '1',
      subject: 'Missed Romantic Dinner Commitment',
      category: 'no-show',
      description: 'Partner committed to cooking dinner but never showed up. No communication beforehand.',
      priority: 'high' as const,
      status: 'resolved' as const,
      createdAt: '2024-08-03T10:30:00Z',
      updatedAt: '2024-08-03T14:30:00Z',
      response: 'Credit penalty of 25 points applied. Partner has acknowledged the issue and committed to better communication.',
      creditImpact: -25,
      requestedAction: 'Credit penalty and better communication',
      userId: 'user1'
    },
    {
      _id: '2',
      subject: 'Half-hearted Movie Night',
      category: 'poor-effort',
      description: 'Partner was on phone entire movie night instead of spending quality time together.',
      priority: 'medium' as const,
      status: 'in-progress' as const,
      createdAt: '2024-08-02T15:45:00Z',
      updatedAt: '2024-08-02T16:30:00Z',
      response: 'Under review. Mediator will help establish phone-free quality time guidelines.',
      creditImpact: 0,
      requestedAction: 'Establish quality time rules',
      userId: 'user1'
    },
    {
      _id: '3',
      subject: 'Last Minute Date Cancellation',
      category: 'late-cancellation',
      description: 'Cancelled our weekend getaway 2 hours before departure with no valid reason.',
      priority: 'high' as const,
      status: 'resolved' as const,
      createdAt: '2024-08-01T09:15:00Z',
      updatedAt: '2024-08-01T14:20:00Z',
      response: 'Credit penalty of 20 points applied. Future cancellations require 24-hour notice minimum.',
      creditImpact: -20,
      requestedAction: 'Credit penalty and cancellation policy',
      userId: 'user1'
    }
  ];

  const grievances = grievancesData?.data || mockGrievances;
  
  const filteredGrievances = filterStatus === 'all' 
    ? grievances 
    : grievances.filter((grievance: any) => grievance.status === filterStatus);

  const onSubmit = (data: GrievanceFormData) => {
    submitGrievanceMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-700 border-red-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryInfo = (category: string) => {
    const cat = grievanceCategories.find(c => c.id === category);
    return cat || { icon: '⚠️', name: 'Other', creditPenalty: 5 };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-romantic-charcoal">Loading accountability reports... 💔</p>
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
              Accountability & Resolution 💔
            </span>
          </h1>
          <p className="text-romantic-charcoal opacity-70 text-lg">
            Address broken promises and maintain relationship trust through accountability
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { label: 'Total Reports', value: grievances.length, icon: '📋', color: 'from-blue-400 to-blue-600' },
            { label: 'Under Review', value: grievances.filter((g: any) => g.status === 'open' || g.status === 'in-progress').length, icon: '🔍', color: 'from-yellow-400 to-yellow-600' },
            { label: 'Resolved', value: grievances.filter((g: any) => g.status === 'resolved').length, icon: '✅', color: 'from-green-400 to-green-600' },
            { label: 'Credits Impacted', value: Math.abs(grievances.reduce((sum: number, g: any) => sum + (g.creditImpact || 0), 0)), icon: '⚖️', color: 'from-red-400 to-red-600' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 text-white`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report New Issue */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <h2 className="text-xl font-semibold text-romantic-charcoal mb-6">Report an Issue</h2>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">⚠️ Important Note</h3>
                  <p className="text-sm text-yellow-700">
                    Accountability reports are serious matters that can affect promise points. 
                    Only submit genuine issues that impact your relationship trust.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-romantic-charcoal">Common Issues:</h3>
                  {grievanceCategories.slice(0, 4).map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-white/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{category.icon}</span>
                        <span className="text-sm font-medium text-romantic-charcoal">{category.name}</span>
                      </div>
                      <span className="text-xs text-red-600 font-medium">-{category.creditPenalty} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={() => setShowSubmitModal(true)}
                className="w-full bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Report Accountability Issue
              </motion.button>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  All reports are reviewed fairly. Both partners will have opportunity to provide their perspective.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Reports List */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-xl font-semibold text-romantic-charcoal mb-4 sm:mb-0">
                  Accountability Reports
                </h2>
                
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {['all', 'open', 'in-progress', 'resolved'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        filterStatus === status
                          ? 'bg-romantic-pink text-white'
                          : 'bg-white/30 text-romantic-charcoal hover:bg-white/40'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredGrievances.map((grievance: any, index: number) => (
                  <motion.div
                    key={grievance._id}
                    className="bg-white/30 rounded-lg p-4 cursor-pointer hover:bg-white/40 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedGrievance(grievance)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCategoryInfo(grievance.category).icon}</span>
                        <div>
                          <h3 className="font-medium text-romantic-charcoal">{grievance.title}</h3>
                          <p className="text-sm text-romantic-charcoal opacity-70">
                            {new Date(grievance.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(grievance.status)}`}>
                          {grievance.status.replace('-', ' ')}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(grievance.severity)}`}>
                          {grievance.severity} priority
                        </span>
                        {grievance.creditImpact !== 0 && (
                          <span className="text-xs font-medium text-red-600">
                            {grievance.creditImpact} pts impact
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-romantic-charcoal opacity-80 line-clamp-2">
                      {grievance.description}
                    </p>
                    
                    {grievance.responseText && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Resolution:</strong> {grievance.responseText}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {filteredGrievances.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">😊</div>
                  <h3 className="text-lg font-medium text-romantic-charcoal mb-2">
                    No accountability issues found
                  </h3>
                  <p className="text-romantic-charcoal opacity-70">
                    {filterStatus === 'all' 
                      ? 'Great! No broken promises to report'
                      : `No ${filterStatus.replace('-', ' ')} reports found`
                    }
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Submit Report Modal */}
      <AnimatePresence>
        {showSubmitModal && (
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
                Report Accountability Issue
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Issue Summary *
                  </label>
                  <input
                    {...register('subject', { required: 'Issue summary is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                    placeholder="Brief description of the broken promise"
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Issue Type *
                  </label>
                  <select
                    {...register('category', { required: 'Issue type is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                  >
                    <option value="">Select issue type</option>
                    {grievanceCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name} (-{cat.creditPenalty} pts)
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Severity *
                  </label>
                  <select
                    {...register('priority', { required: 'Severity is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent"
                  >
                    <option value="">Select severity</option>
                    <option value="low">Low - Minor issue, first occurrence</option>
                    <option value="medium">Medium - Significant impact on trust</option>
                    <option value="high">High - Major broken promise, recurring issue</option>
                  </select>
                  {errors.priority && (
                    <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    What happened? *
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent resize-none"
                    placeholder="Provide specific details about the broken promise or issue..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-charcoal mb-2">
                    Requested Resolution *
                  </label>
                  <textarea
                    {...register('requestedAction', { required: 'Requested action is required' })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romantic-pink focus:border-transparent resize-none"
                    placeholder="What would help resolve this issue and prevent it in the future?"
                  />
                  {errors.requestedAction && (
                    <p className="text-red-500 text-sm mt-1">{errors.requestedAction.message}</p>
                  )}
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitGrievanceMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {submitGrievanceMutation.isPending ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedGrievance && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-romantic-charcoal mb-2">
                    {selectedGrievance.title}
                  </h2>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedGrievance.status)}`}>
                      {selectedGrievance.status.replace('-', ' ')}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(selectedGrievance.severity)}`}>
                      {selectedGrievance.severity} priority
                    </span>
                    {selectedGrievance.creditImpact !== 0 && (
                      <span className="text-sm font-medium text-red-600">
                        {selectedGrievance.creditImpact} pts impact
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGrievance(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-romantic-charcoal mb-2">What Happened</h3>
                  <p className="text-romantic-charcoal opacity-80">{selectedGrievance.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-romantic-charcoal mb-1">Issue Type</h4>
                    <p className="text-romantic-charcoal opacity-70">
                      {getCategoryInfo(selectedGrievance.category).icon} {getCategoryInfo(selectedGrievance.category).name}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-romantic-charcoal mb-1">Reported</h4>
                    <p className="text-romantic-charcoal opacity-70">
                      {new Date(selectedGrievance.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedGrievance.description && (
                  <div>
                    <h3 className="font-medium text-romantic-charcoal mb-2">Requested Resolution</h3>
                    <p className="text-romantic-charcoal opacity-80">{selectedGrievance.description}</p>
                  </div>
                )}

                {selectedGrievance.responseText && (
                  <div>
                    <h3 className="font-medium text-romantic-charcoal mb-2">Resolution & Action Taken</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800">{selectedGrievance.responseText}</p>
                      <p className="text-blue-600 text-sm mt-2">
                        Resolved: {new Date(selectedGrievance.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GrievancesPage;
