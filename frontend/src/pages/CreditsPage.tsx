import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creditsAPI } from '../utils/api';
import { Credit } from '../types';
import toast from 'react-hot-toast';

const CreditsPage: React.FC = () => {
  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const queryClient = useQueryClient();

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

  // Add credits mutation
  const addCreditsMutation = useMutation({
    mutationFn: (data: { amount: number }) => creditsAPI.addCredits(data),
    onSuccess: () => {
      toast.success('Credits added successfully! 💎');
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['credits-history'] });
      setShowAddCreditsModal(false);
      setSelectedPackage(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add credits');
    },
  });

  const creditPackages = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 100,
      price: 10,
      bonus: 0,
      popular: false,
      icon: '✨',
      description: 'Perfect for trying out our services'
    },
    {
      id: 'popular',
      name: 'Popular Pack',
      credits: 250,
      price: 20,
      bonus: 50,
      popular: true,
      icon: '💎',
      description: 'Most popular choice with bonus credits'
    },
    {
      id: 'premium',
      name: 'Premium Pack',
      credits: 500,
      price: 35,
      bonus: 150,
      popular: false,
      icon: '👑',
      description: 'Best value with maximum bonus'
    },
    {
      id: 'ultimate',
      name: 'Ultimate Pack',
      credits: 1000,
      price: 60,
      bonus: 400,
      popular: false,
      icon: '🌟',
      description: 'Ultimate package for couples who love experiences'
    }
  ];

  const mockHistory = [
    {
      _id: '1',
      type: 'purchase',
      amount: 250,
      description: 'Credit Package Purchase',
      date: '2024-08-03T10:30:00Z',
      status: 'completed',
      reference: 'PKG-001'
    },
    {
      _id: '2',
      type: 'spend',
      amount: -50,
      description: 'Romantic Dinner Booking',
      date: '2024-08-02T15:45:00Z',
      status: 'completed',
      reference: 'SRV-002'
    },
    {
      _id: '3',
      type: 'bonus',
      amount: 25,
      description: 'Referral Bonus',
      date: '2024-08-01T09:15:00Z',
      status: 'completed',
      reference: 'REF-003'
    },
    {
      _id: '4',
      type: 'spend',
      amount: -75,
      description: 'Spa Day Experience',
      date: '2024-07-30T14:20:00Z',
      status: 'completed',
      reference: 'SRV-004'
    }
  ];

  const currentBalance = creditsData?.data?.balance ?? creditsData?.data ?? 350;
  const transactionHistory = Array.isArray(historyData?.data) ? historyData?.data : mockHistory;

  const filteredTransactions = filterType === 'all' 
    ? transactionHistory 
    : (Array.isArray(transactionHistory) ? transactionHistory.filter((transaction: any) => transaction.type === filterType) : []);

  const handleBuyCredits = (pkg: any) => {
    setSelectedPackage(pkg);
    setShowAddCreditsModal(true);
  };

  const confirmPurchase = () => {
    if (selectedPackage) {
      addCreditsMutation.mutate({ amount: selectedPackage.credits + selectedPackage.bonus });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return '💰';
      case 'spend': return '💸';
      case 'bonus': return '🎁';
      case 'refund': return '↩️';
      default: return '💎';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-green-600';
      case 'spend': return 'text-red-600';
      case 'bonus': return 'text-blue-600';
      case 'refund': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-romantic-charcoal">Loading credits... 💎</p>
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
              Your Credits 💎
            </span>
          </h1>
          <p className="text-romantic-charcoal opacity-70 text-lg">
            Manage your credits and view transaction history
          </p>
        </motion.div>

        {/* Current Balance Card */}
        <motion.div
          className="bg-gradient-to-r from-romantic-pink to-romantic-coral rounded-2xl p-8 text-white mb-8 shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">💎</div>
            <h2 className="text-3xl font-bold mb-2">{currentBalance.toLocaleString()} Credits</h2>
            <p className="text-white/80 text-lg">Available Balance</p>
            <motion.button
              onClick={() => setShowAddCreditsModal(true)}
              className="mt-6 bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-full hover:bg-white/30 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Credits ✨
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Credit Packages */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-romantic-charcoal mb-6">Credit Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {creditPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  className={`relative bg-white/20 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${
                    pkg.popular 
                      ? 'border-romantic-pink shadow-lg' 
                      : 'border-white/30'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-romantic-pink to-romantic-coral text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-4xl mb-4">{pkg.icon}</div>
                    <h3 className="text-xl font-semibold text-romantic-charcoal mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-romantic-charcoal opacity-70 text-sm mb-4">
                      {pkg.description}
                    </p>

                    <div className="mb-6">
                      <div className="text-3xl font-bold text-romantic-charcoal mb-2">
                        ${pkg.price}
                      </div>
                      <div className="space-y-1">
                        <div className="text-lg font-medium text-romantic-charcoal">
                          {pkg.credits} Credits
                        </div>
                        {pkg.bonus > 0 && (
                          <div className="text-sm text-green-600 font-medium">
                            + {pkg.bonus} Bonus Credits
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyCredits(pkg)}
                      className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-300 ${
                        pkg.popular
                          ? 'bg-gradient-to-r from-romantic-pink to-romantic-coral text-white hover:opacity-90'
                          : 'bg-white/30 text-romantic-charcoal hover:bg-white/40'
                      }`}
                    >
                      Purchase Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Transaction History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <h2 className="text-xl font-semibold text-romantic-charcoal mb-6">Transaction History</h2>
              
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['all', 'purchase', 'spend', 'bonus'].map((type) => (
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

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Array.isArray(filteredTransactions) && filteredTransactions.map((transaction: any) => (
                  <motion.div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 bg-white/30 rounded-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-romantic-charcoal text-sm">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-romantic-charcoal opacity-60">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </p>
                      <p className="text-xs text-romantic-charcoal opacity-60">
                        {transaction.reference}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {(!Array.isArray(filteredTransactions) || filteredTransactions.length === 0) && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-romantic-charcoal opacity-70">No transactions found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showAddCreditsModal && (
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
              {selectedPackage ? (
                <>
                  <h2 className="text-2xl font-semibold text-romantic-charcoal mb-6">
                    Confirm Purchase
                  </h2>
                  
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-4">{selectedPackage.icon}</div>
                    <h3 className="text-xl font-medium text-romantic-charcoal mb-2">
                      {selectedPackage.name}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Base Credits:</span>
                        <span className="font-medium">{selectedPackage.credits}</span>
                      </div>
                      {selectedPackage.bonus > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Bonus Credits:</span>
                          <span className="font-medium">+{selectedPackage.bonus}</span>
                        </div>
                      )}
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total Credits:</span>
                          <span>{selectedPackage.credits + selectedPackage.bonus}</span>
                        </div>
                        <div className="flex justify-between font-bold text-romantic-pink">
                          <span>Price:</span>
                          <span>${selectedPackage.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setShowAddCreditsModal(false);
                        setSelectedPackage(null);
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmPurchase}
                      disabled={addCreditsMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-romantic-pink to-romantic-coral text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {addCreditsMutation.isPending ? 'Processing...' : 'Purchase'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold text-romantic-charcoal mb-6">
                    Choose Credit Package
                  </h2>
                  <div className="space-y-4">
                    {creditPackages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl mr-3">{pkg.icon}</span>
                            <span className="font-medium">{pkg.name}</span>
                          </div>
                          <span className="font-bold text-romantic-pink">${pkg.price}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowAddCreditsModal(false)}
                    className="w-full mt-6 bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreditsPage;
