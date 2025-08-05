import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { creditsAPI } from '../utils/api';

const CreditsPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');

  // Fetch credits balance
  const { data: creditsData, isLoading } = useQuery({
    queryKey: ['credits'],
    queryFn: () => creditsAPI.getBalance(),
  });

  // Fetch transaction history
  const { data: historyData } = useQuery({
    queryKey: ['credits-history'],
    queryFn: () => creditsAPI.getHistory(),
  });

  // Mock credit history showing promise-keeping behavior
  const mockHistory = [
    {
      _id: '1',
      type: 'earned',
      amount: 15,
      description: 'Romantic dinner completed - Excellent rating from partner',
      date: '2024-08-03T10:30:00Z',
      status: 'completed',
      serviceId: 'SRV-001',
      rating: 5
    },
    {
      _id: '2',
      type: 'reserved',
      amount: -25,
      description: 'Weekend getaway booking - Promise locked',
      date: '2024-08-02T15:45:00Z',
      status: 'pending',
      serviceId: 'SRV-002',
      rating: null
    },
    {
      _id: '3',
      type: 'penalty',
      amount: -10,
      description: 'Late cancellation - Promise broken',
      date: '2024-08-01T09:15:00Z',
      status: 'completed',
      serviceId: 'SRV-003',
      rating: 1
    },
    {
      _id: '4',
      type: 'earned',
      amount: 20,
      description: 'Movie night - Great experience rating',
      date: '2024-07-30T19:30:00Z',
      status: 'completed',
      serviceId: 'SRV-004',
      rating: 4
    },
    {
      _id: '5',
      type: 'grievance',
      amount: -15,
      description: 'Partner complaint resolved - Credit deducted',
      date: '2024-07-28T14:20:00Z',
      status: 'completed',
      serviceId: 'GRV-001',
      rating: null
    },
    {
      _id: '6',
      type: 'bonus',
      amount: 10,
      description: 'Weekly promise completion streak bonus',
      date: '2024-07-25T08:00:00Z',
      status: 'completed',
      serviceId: null,
      rating: null
    }
  ];

  const currentBalance = creditsData?.data?.balance ?? creditsData?.data ?? 75;
  const transactionHistory = Array.isArray(historyData?.data) ? historyData?.data : mockHistory;

  const filteredTransactions = filterType === 'all' 
    ? transactionHistory 
    : (Array.isArray(transactionHistory) ? transactionHistory.filter((transaction: any) => transaction.type === filterType) : []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned': return '⭐';
      case 'reserved': return '🔒';
      case 'penalty': return '❌';
      case 'bonus': return '🎁';
      case 'grievance': return '⚠️';
      default: return '💳';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned': return 'text-green-600';
      case 'bonus': return 'text-blue-600';
      case 'reserved': return 'text-yellow-600';
      case 'penalty': return 'text-red-600';
      case 'grievance': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getCreditTier = (balance: number) => {
    if (balance >= 100) return { name: 'Promise Keeper Elite', color: 'from-purple-400 to-purple-600', icon: '👑' };
    if (balance >= 50) return { name: 'Reliable Partner', color: 'from-green-400 to-green-600', icon: '🌟' };
    if (balance >= 25) return { name: 'Trustworthy', color: 'from-blue-400 to-blue-600', icon: '💎' };
    if (balance >= 0) return { name: 'Building Trust', color: 'from-yellow-400 to-yellow-600', icon: '🌱' };
    return { name: 'Needs Improvement', color: 'from-red-400 to-red-600', icon: '⚠️' };
  };

  const currentTier = getCreditTier(currentBalance);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-romantic-charcoal">Loading promise score... 💕</p>
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
              Promise Score & Accountability 💕
            </span>
          </h1>
          <p className="text-romantic-charcoal opacity-70 text-lg">
            Track your relationship promises and build trust through accountability
          </p>
        </motion.div>

        {/* Current Status */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`bg-gradient-to-r ${currentTier.color} rounded-2xl p-8 text-white text-center`}>
            <div className="text-6xl mb-4">{currentTier.icon}</div>
            <h2 className="text-3xl font-bold mb-2">{currentBalance} Promise Points</h2>
            <p className="text-xl opacity-90">{currentTier.name}</p>
            <div className="mt-4 text-sm opacity-80">
              {currentBalance >= 100 ? 'You can now make custom special service requests!' :
               currentBalance >= 50 ? 'Almost there! Keep being reliable to unlock special privileges.' :
               currentBalance >= 25 ? 'You\'re building trust! Continue keeping your promises.' :
               currentBalance >= 0 ? 'Focus on completing promises to improve your score.' :
               'Your score needs improvement. Be more reliable in your commitments.'}
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { 
              label: 'Promises Kept', 
              value: (transactionHistory || []).filter((t: any) => t.type === 'earned').length, 
              icon: '✅', 
              color: 'from-green-400 to-green-600' 
            },
            { 
              label: 'Active Commitments', 
              value: (transactionHistory || []).filter((t: any) => t.type === 'reserved' && t.status === 'pending').length, 
              icon: '🔒', 
              color: 'from-yellow-400 to-yellow-600' 
            },
            { 
              label: 'Broken Promises', 
              value: (transactionHistory || []).filter((t: any) => t.type === 'penalty').length, 
              icon: '❌', 
              color: 'from-red-400 to-red-600' 
            },
            { 
              label: 'Bonus Earned', 
              value: (transactionHistory || []).filter((t: any) => t.type === 'bonus').length, 
              icon: '🎁', 
              color: 'from-purple-400 to-purple-600' 
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 text-white`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
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
          {/* How It Works */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <h2 className="text-xl font-semibold text-romantic-charcoal mb-6">How Promise Points Work</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="font-medium text-romantic-charcoal">Book a Service</p>
                    <p className="text-sm text-romantic-charcoal opacity-70">
                      Use points to book a romantic service. Points get locked as a commitment.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🤝</span>
                  <div>
                    <p className="font-medium text-romantic-charcoal">Partner Confirmation</p>
                    <p className="text-sm text-romantic-charcoal opacity-70">
                      Your partner gets notified and confirms the date commitment.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="font-medium text-romantic-charcoal">Complete & Rate</p>
                    <p className="text-sm text-romantic-charcoal opacity-70">
                      After the service, your partner rates the experience.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="font-medium text-romantic-charcoal">Earn Rewards</p>
                    <p className="text-sm text-romantic-charcoal opacity-70">
                      Good ratings earn bonus points. Poor performance loses points.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/30 rounded-lg">
                <h3 className="font-medium text-romantic-charcoal mb-2">Accountability Rules</h3>
                <ul className="text-sm text-romantic-charcoal opacity-80 space-y-1">
                  <li>• Broken promises = Point penalties</li>
                  <li>• Complaints = Point deductions</li>
                  <li>• Consistent reliability = Bonus points</li>
                  <li>• 100+ points = Custom service requests</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Transaction History */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-xl font-semibold text-romantic-charcoal mb-4 sm:mb-0">
                  Promise History
                </h2>
                
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {['all', 'earned', 'reserved', 'penalty', 'bonus', 'grievance'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        filterType === type
                          ? 'bg-romantic-pink text-white'
                          : 'bg-white/30 text-romantic-charcoal hover:bg-white/40'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Array.isArray(filteredTransactions) && filteredTransactions.map((transaction: any, index: number) => (
                  <motion.div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 bg-white/30 rounded-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                      <div>
                        <p className="font-medium text-romantic-charcoal">{transaction.description}</p>
                        <div className="flex items-center space-x-4">
                          <p className="text-sm text-romantic-charcoal opacity-70">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                          {transaction.rating && (
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-romantic-charcoal opacity-70">Rating:</span>
                              <span className="text-sm">{'⭐'.repeat(transaction.rating)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </span>
                      <div className="text-xs text-romantic-charcoal opacity-60">
                        {transaction.status === 'pending' ? 'Locked' : 'Completed'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {(!Array.isArray(filteredTransactions) || filteredTransactions.length === 0) && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-romantic-charcoal opacity-70">No promise activity found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreditsPage;
