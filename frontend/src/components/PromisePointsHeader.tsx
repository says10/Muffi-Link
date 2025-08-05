import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { creditsAPI } from '../utils/api';

const PromisePointsHeader: React.FC = () => {
  // Fetch current promise points
  const { data: creditsData, isLoading, error } = useQuery({
    queryKey: ['credits'],
    queryFn: () => creditsAPI.getBalance(),
    refetchInterval: 30000, // Refetch every 30 seconds to keep it current
    retry: 3, // Retry failed requests
    staleTime: 0, // Always consider data stale to force fresh fetches
    gcTime: 0, // Don't cache data
  });

  // Extract balance with proper fallback - use same structure as dashboard
  const currentBalance = creditsData?.data?.data?.balance || 
                        creditsData?.data?.balance || 
                        creditsData?.balance || 0;
  
  // Debug logging to verify the structure
  console.log('🔍 Credits API Response:', creditsData);
  console.log('🎯 Extracted Balance:', currentBalance);

  // If loading, show a basic header
  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-r from-romantic-pink/10 via-romantic-pearl/20 to-romantic-lavender/10 backdrop-blur-md border-b border-romantic-pink/20 px-6 py-4 fixed top-0 left-0 right-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-romantic-pink border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-romantic-charcoal/70 font-medium">Loading Promise Points...</span>
          </div>
        </div>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="w-full bg-gradient-to-r from-red-100 to-pink-100 backdrop-blur-md border-b border-red-200 px-6 py-4 fixed top-0 left-0 right-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚠️</span>
            <span className="text-sm text-red-700 font-medium">Error loading Promise Points</span>
          </div>
        </div>
      </div>
    );
  }

  const getCreditTier = (balance: number) => {
    if (balance >= 100) return { name: 'Promise Keeper Elite', color: 'from-purple-400 to-purple-600', icon: '👑', bgColor: 'bg-purple-100' };
    if (balance >= 50) return { name: 'Reliable Partner', color: 'from-green-400 to-green-600', icon: '🌟', bgColor: 'bg-green-100' };
    if (balance >= 25) return { name: 'Trustworthy', color: 'from-blue-400 to-blue-600', icon: '💎', bgColor: 'bg-blue-100' };
    if (balance >= 0) return { name: 'Building Trust', color: 'from-yellow-400 to-yellow-600', icon: '🌱', bgColor: 'bg-yellow-100' };
    return { name: 'Needs Improvement', color: 'from-red-400 to-red-600', icon: '⚠️', bgColor: 'bg-red-100' };
  };

  const currentTier = getCreditTier(currentBalance);
  const progressToNext = currentBalance >= 100 ? 100 : 
                        currentBalance >= 50 ? ((currentBalance - 50) / 50) * 100 :
                        currentBalance >= 25 ? ((currentBalance - 25) / 25) * 100 :
                        currentBalance >= 0 ? (currentBalance / 25) * 100 : 0;

  const nextMilestone = currentBalance >= 100 ? 'Max Level' :
                       currentBalance >= 50 ? '100 pts (Elite)' :
                       currentBalance >= 25 ? '50 pts (Reliable)' :
                       currentBalance >= 0 ? '25 pts (Trustworthy)' : '0 pts';

  return (
    <motion.div
      className="w-full bg-gradient-to-r from-romantic-pink/20 via-romantic-pearl/30 to-romantic-lavender/20 backdrop-blur-md border-b border-romantic-pink/20 px-6 py-4 fixed top-0 left-0 right-0 z-40 shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Promise Score Display */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-romantic-pink to-romantic-lavender flex items-center justify-center shadow-md">
              <span className="text-2xl">{currentTier.icon}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-romantic-charcoal to-romantic-pink bg-clip-text text-transparent">
                  {currentBalance} Promise Points
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-romantic-charcoal/80 font-medium">
                  {currentTier.name}
                </span>
                {currentBalance < 100 && (
                  <span className="text-xs text-romantic-charcoal/60 bg-white/50 px-2 py-1 rounded-full">
                    Next: {nextMilestone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-4">
          {/* Progress Bar */}
          {currentBalance < 100 && (
            <div className="flex items-center space-x-3">
              <div className="text-xs text-romantic-charcoal/70 font-medium whitespace-nowrap">
                Progress:
              </div>
              <div className="w-32 h-3 bg-white/40 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className={`h-full bg-gradient-to-r ${currentTier.color} rounded-full shadow-sm`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs text-romantic-charcoal/70 font-medium min-w-[2rem]">
                {Math.round(progressToNext)}%
              </span>
            </div>
          )}

          {/* Elite Status */}
          {currentBalance >= 100 && (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-purple-700">
                🎉 Elite Status - Custom Requests Available!
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PromisePointsHeader;
