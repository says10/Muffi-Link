import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  creditsAPI, 
  moodboardAPI, 
  servicesAPI, 
  appointmentsAPI,
  grievancesAPI
} from '../utils/api';
import { 
  Credit, 
  Moodboard, 
  Service, 
  Grievance 
} from '../types';

interface DashboardStats {
  totalCredits: number;
  activeMoodboards: number;
  pendingServices: number;
  unresolvedGrievances: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Debug user data
  console.log('🔍 Dashboard User Data:', {
    user: user,
    partnerId: user?.partnerId,
    hasPartner: !!user?.partnerId,
    partnerType: typeof user?.partnerId
  });
  
  const [stats, setStats] = useState<DashboardStats>({
    totalCredits: 0,
    activeMoodboards: 0,
    pendingServices: 0,
    unresolvedGrievances: 0
  });

  // Fetch credits data - use same query key as header for synchronization
  const { data: creditsData, isLoading: creditsLoading, error: creditsError } = useQuery({
    queryKey: ['credits'],
    queryFn: () => creditsAPI.getBalance(),
    enabled: !!user,
  });

  const { data: creditsHistory } = useQuery({
    queryKey: ['credits-history'],
    queryFn: () => creditsAPI.getHistory(),
    enabled: !!user,
  });

  // Fetch moodboards data
  const { data: moodboardsData } = useQuery({
    queryKey: ['moodboards'],
    queryFn: () => moodboardAPI.getMoodboards(),
    enabled: !!user,
  });

  // Fetch services data
  const { data: servicesData } = useQuery({
    queryKey: ['appointments-dashboard'],
    queryFn: () => appointmentsAPI.getAppointments(),
    enabled: !!user,
  });

  // Fetch grievances data
  const { data: grievancesData } = useQuery({
    queryKey: ['grievances'],
    queryFn: () => grievancesAPI.getGrievances(),
    enabled: !!user,
  });

  // Update stats when data changes - make it more resilient
  useEffect(() => {
    console.log('🔍 Dashboard Data Check:', {
      creditsData: creditsData,
      moodboardsData: moodboardsData,
      servicesData: servicesData,
      grievancesData: grievancesData
    });

    // Update stats even if some data is missing
    const credits = creditsData?.data?.data?.balance || 0;
    
    // Safely handle array data with proper checks - fix moodboard data structure
    const moodboardsArray = Array.isArray(moodboardsData?.data?.data) ? moodboardsData?.data?.data : [];
    const appointmentsArray = Array.isArray(servicesData?.data?.data) ? servicesData?.data?.data : [];
    const grievancesArray = Array.isArray(grievancesData?.data) ? grievancesData?.data : 
                           Array.isArray(grievancesData?.data?.data) ? grievancesData?.data?.data :
                           Array.isArray(grievancesData) ? grievancesData : [];
    
    console.log('🎨 Moodboards Debug:', {
      moodboardsData: moodboardsData,
      dataPath: moodboardsData?.data,
      dataDataPath: moodboardsData?.data?.data,
      isArray: Array.isArray(moodboardsData?.data?.data),
      finalArray: moodboardsArray,
      arrayLength: moodboardsArray.length
    });
    
    const activeMoodboards = moodboardsArray.filter((m: Moodboard) => {
      console.log('🎨 Checking moodboard:', m.moodName, 'isActive:', m.isActive);
      return m.isActive;
    }).length;
    
    console.log('🎨 Active moodboards count:', activeMoodboards);
    // Count upcoming appointments (pending + confirmed, future dates)
    const upcomingAppointments = appointmentsArray.filter((appointment: any) => 
      (appointment.status === 'pending' || appointment.status === 'confirmed') &&
      new Date(appointment.date) >= new Date(new Date().toDateString())
    ).length;
    const unresolvedGrievances = grievancesArray?.filter((g: Grievance) => g.status === 'pending').length || 0;

    console.log('🎯 Dashboard Debug:', {
      rawCreditsData: creditsData,
      extractedCredits: credits,
      path1: creditsData?.data?.balance,
      path2: creditsData?.data?.data?.balance,
      moodboardsArrayLength: moodboardsArray.length,
      activeMoodboardsCount: activeMoodboards,
      fullMoodboardsArray: moodboardsArray,
      appointmentsArrayLength: appointmentsArray.length,
      grievancesArrayLength: grievancesArray?.length || 0
    });

    setStats({
      totalCredits: credits,
      activeMoodboards,
      pendingServices: upcomingAppointments,
      unresolvedGrievances
    });
  }, [creditsData, moodboardsData, servicesData, grievancesData]);

  // Auto-initialize moodboards if user has none, or fix active states if multiple are active
  useEffect(() => {
    if (moodboardsData && Array.isArray(moodboardsData?.data?.data)) {
      const moodboardsArray = moodboardsData.data.data;
      
      if (moodboardsArray.length === 0) {
        console.log('🎨 No moodboards found, initializing defaults...');
        moodboardAPI.initializeMoodboards()
          .then(() => {
            console.log('✅ Default moodboards initialized');
            // Refetch moodboards
            queryClient.invalidateQueries({ queryKey: ['moodboards'] });
          })
          .catch(error => {
            console.error('❌ Failed to initialize moodboards:', error);
          });
      } else {
        // Check if multiple moodboards are active
        const activeMoodboards = moodboardsArray.filter((m: any) => m.isActive);
        if (activeMoodboards.length > 1) {
          console.log('🔧 Multiple active moodboards detected, fixing...');
          moodboardAPI.fixActiveStates()
            .then(() => {
              console.log('✅ Moodboard active states fixed');
              // Refetch moodboards
              queryClient.invalidateQueries({ queryKey: ['moodboards'] });
            })
            .catch(error => {
              console.error('❌ Failed to fix moodboard active states:', error);
            });
        }
      }
    }
  }, [moodboardsData, queryClient]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-romantic-charcoal">Loading... 💕</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-romantic-peach/30 via-romantic-lavender/20 to-romantic-mint/30">
      <div className="flex">
        {/* Partner Sidebar */}
        <div className="w-80 bg-white/20 backdrop-blur-sm border-r border-white/30 min-h-screen p-6">
          <div className="sticky top-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-romantic-pink to-romantic-coral rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white">👫</span>
              </div>
              <h3 className="text-xl font-semibold text-romantic-charcoal mb-2">Your Partner</h3>
              <p className="text-sm text-romantic-charcoal/70">Connected Hearts</p>
            </div>

            {/* Partner Information */}
            {user?.partnerId ? (
              <>
                {/* Partner Details */}
                <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-romantic-lavender to-romantic-mint rounded-full flex items-center justify-center">
                      <span className="text-lg text-white">
                        {typeof user.partnerId === 'object' && user.partnerId.role === 'boyfriend' ? '👨' : 
                         typeof user.partnerId === 'object' && user.partnerId.role === 'girlfriend' ? '👩' : '👫'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-romantic-charcoal">
                        {typeof user.partnerId === 'object' ? 
                          `${user.partnerId.firstName} ${user.partnerId.lastName}` : 
                          'Partner Connected'}
                      </p>
                      <p className="text-sm text-romantic-charcoal/70 capitalize">
                        {typeof user.partnerId === 'object' ? user.partnerId.role : 'Partner'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-romantic-charcoal/70">
                    {typeof user.partnerId === 'object' ? user.partnerId.email : 'Partner email not available'}
                  </p>
                </div>

                {/* Partner Stats */}
                <div className="space-y-4">
                  <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-romantic-charcoal/70">Connection Status</span>
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    </div>
                    <p className="font-semibold text-romantic-charcoal">Active</p>
                  </div>

                  <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-sm text-romantic-charcoal/70 mb-2">Days Together</div>
                    <p className="font-semibold text-romantic-charcoal">
                      {user.relationshipStartDate ? 
                        `${Math.floor((new Date().getTime() - new Date(user.relationshipStartDate).getTime()) / (1000 * 60 * 60 * 24))} Days 💕` : 
                        'New Connection 💕'}
                    </p>
                  </div>

                  <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-sm text-romantic-charcoal/70 mb-2">Shared Moodboards</div>
                    <p className="font-semibold text-romantic-charcoal">{moodboardsData?.data?.data?.length || 0}</p>
                  </div>

                  <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-sm text-romantic-charcoal/70 mb-2">Last Activity</div>
                    <p className="font-semibold text-romantic-charcoal">Recently active</p>
                  </div>
                </div>
              </>
            ) : (
              /* No Partner Connected */
              <div className="text-center">
                <div className="bg-white/30 backdrop-blur-sm rounded-lg p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-romantic-charcoal/20 to-romantic-charcoal/40 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">💔</span>
                  </div>
                  <h4 className="font-semibold text-romantic-charcoal mb-2">No Partner Connected</h4>
                  <p className="text-sm text-romantic-charcoal/70 mb-4">
                    Connect with your partner using the same access key to start your journey together
                  </p>
                  <button 
                    onClick={() => navigate('/auth')}
                    className="bg-gradient-to-r from-romantic-pink to-romantic-coral text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-90 transition-all"
                  >
                    Connect Partner
                  </button>
                </div>
              </div>
            )}

            {/* Quick Partner Actions */}
            {user?.partnerId && (
              <div className="mt-6 space-y-3">
                <button 
                  onClick={() => navigate('/love-notes')}
                  className="w-full bg-gradient-to-r from-romantic-pink to-romantic-coral text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-90 transition-all"
                >
                  💌 Send Love Note
                </button>
                <button 
                  onClick={() => navigate('/memories')}
                  className="w-full bg-white/30 backdrop-blur-sm text-romantic-charcoal py-2 px-4 rounded-lg text-sm font-medium hover:bg-white/40 transition-all"
                >
                  📸 Share Memory
                </button>
                <button 
                  onClick={() => navigate('/services')}
                  className="w-full bg-white/30 backdrop-blur-sm text-romantic-charcoal py-2 px-4 rounded-lg text-sm font-medium hover:bg-white/40 transition-all"
                >
                  🎁 Plan Surprise
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-romantic mb-2">
              <span className="bg-gradient-to-r from-romantic-pink to-romantic-coral bg-clip-text text-transparent">
                {getGreeting()}, {user.name}! 💕
              </span>
            </h1>
          <p className="text-romantic-charcoal opacity-70">
            Track promises, build trust, and strengthen your relationship through accountability
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="bg-gradient-to-br from-romantic-pink/20 to-romantic-lavender/20 backdrop-blur-sm rounded-2xl p-6 border border-romantic-pink/30 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-romantic-charcoal opacity-70 text-sm font-medium">Promise Points</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-romantic-charcoal to-romantic-pink bg-clip-text text-transparent">
                  {stats.totalCredits}
                </p>
              </div>
              <div className="text-4xl">
                {stats.totalCredits >= 100 ? '👑' : 
                 stats.totalCredits >= 50 ? '🌟' : 
                 stats.totalCredits >= 25 ? '💎' : '🌱'}
              </div>
            </div>
            <div className="text-xs text-romantic-charcoal/70 font-medium">
              {stats.totalCredits >= 100 ? 'Promise Keeper Elite' : 
               stats.totalCredits >= 50 ? 'Reliable Partner' : 
               stats.totalCredits >= 25 ? 'Trustworthy' : 'Building Trust'}
            </div>
            {stats.totalCredits < 100 && (
              <div className="mt-2">
                <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-romantic-pink to-romantic-lavender rounded-full transition-all duration-1000"
                    style={{ 
                      width: stats.totalCredits >= 50 ? 
                        `${((stats.totalCredits - 50) / 50) * 100}%` : 
                        stats.totalCredits >= 25 ? 
                        `${((stats.totalCredits - 25) / 25) * 100}%` : 
                        `${(stats.totalCredits / 25) * 100}%`
                    }}
                  />
                </div>
                <p className="text-xs text-romantic-charcoal/60 mt-1">
                  Next: {stats.totalCredits >= 50 ? '100 pts (Elite)' : 
                         stats.totalCredits >= 25 ? '50 pts (Reliable)' : '25 pts (Trustworthy)'}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-romantic-charcoal opacity-70 text-sm">Active Moodboards</p>
                <p className="text-2xl font-bold text-romantic-charcoal">{stats.activeMoodboards}</p>
              </div>
              <div className="text-3xl">🎨</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-romantic-charcoal opacity-70 text-sm">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-romantic-charcoal">{stats.pendingServices}</p>
              </div>
              <div className="text-3xl">�</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-romantic-charcoal opacity-70 text-sm">Accountability Reports</p>
                <p className="text-2xl font-bold text-romantic-charcoal">{stats.unresolvedGrievances}</p>
              </div>
              <div className="text-3xl">⚖️</div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Recent Activities */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Recent Credits */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-romantic-charcoal mb-4">Recent Credits</h3>
              <div className="space-y-3">
                {creditsHistory?.data && Array.isArray(creditsHistory.data) ? 
                  creditsHistory.data.slice(0, 3).map((credit: Credit) => (
                    <div key={credit._id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                      <div>
                        <p className="font-medium text-romantic-charcoal">{credit.reason}</p>
                        <p className="text-sm text-romantic-charcoal opacity-70">{formatDate(credit.createdAt)}</p>
                      </div>
                      <div className={`font-bold ${credit.type === 'earned' ? 'text-green-600' : 'text-red-500'}`}>
                        {credit.type === 'earned' ? '+' : '-'}{credit.amount}
                      </div>
                    </div>
                  )) : (
                  <p className="text-romantic-charcoal opacity-70 text-center py-4">No recent credits</p>
                )}
              </div>
            </div>

            {/* My Appointments */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-romantic-charcoal">My Appointments</h3>
                <button 
                  onClick={() => navigate('/appointments')}
                  className="text-sm text-romantic-pink hover:text-romantic-coral transition-colors"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {servicesData?.data?.data && Array.isArray(servicesData.data.data) ? (
                  (() => {
                    // Filter for upcoming appointments (pending or confirmed, future dates)
                    const upcomingAppointments = servicesData.data.data
                      .filter((appointment: any) => 
                        (appointment.status === 'pending' || appointment.status === 'confirmed') &&
                        new Date(appointment.date) >= new Date(new Date().toDateString()) // Today or future
                      )
                      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .slice(0, 3);

                    return upcomingAppointments.length > 0 ? upcomingAppointments.map((appointment: any) => (
                      <div 
                        key={appointment._id} 
                        className="p-4 bg-white/10 rounded-lg border border-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                        onClick={() => navigate(`/appointments/${appointment._id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-romantic-charcoal mb-1">{appointment.serviceName}</p>
                            <div className="flex items-center gap-3 text-sm text-romantic-charcoal opacity-70 mb-2">
                              <span>📅 {formatDate(appointment.date)}</span>
                              <span>🕒 {appointment.time}</span>
                            </div>
                            {appointment.location && (
                              <p className="text-sm text-romantic-charcoal opacity-70 mb-2">
                                📍 {appointment.location}
                              </p>
                            )}
                            {appointment.description && (
                              <p className="text-sm text-romantic-charcoal opacity-70 mb-2">
                                💭 {appointment.description}
                              </p>
                            )}
                            <p className="text-sm text-romantic-charcoal opacity-70">
                              💳 {appointment.creditCost || 0} credits
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {appointment.status === 'pending' ? 'Awaiting Partner Confirmation' : 
                             appointment.status === 'confirmed' ? 'Confirmed' :
                             appointment.status === 'cancelled' ? 'Cancelled' :
                             appointment.status}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-6">
                        <p className="text-romantic-charcoal opacity-70 mb-3">No upcoming appointments</p>
                        <button
                          onClick={() => navigate('/services')}
                          className="px-4 py-2 bg-romantic-pink text-white rounded-lg hover:bg-romantic-coral transition-colors text-sm"
                        >
                          Book Your First Service 💕
                        </button>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-romantic-charcoal opacity-70 text-center py-4">Loading appointments...</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Moodboards & Grievances */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {/* Active Moodboards */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-romantic-charcoal">Active Moodboards</h3>
                <button 
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ['moodboards'] });
                    console.log('🔄 Manually refreshing moodboards...');
                  }}
                  className="text-sm bg-romantic-pink/20 hover:bg-romantic-pink/30 px-3 py-1 rounded-lg text-romantic-charcoal"
                >
                  Refresh
                </button>
              </div>
              <div className="space-y-3">
                {(() => {
                  // Get moodboards array using the same logic as stats
                  const moodboardsArray = (moodboardsData && Array.isArray(moodboardsData.data)) ? moodboardsData.data : 
                                         (moodboardsData && Array.isArray(moodboardsData.data?.data)) ? moodboardsData.data.data : [];
                  
                  const activeMoodboards = moodboardsArray.filter((m: Moodboard) => m.isActive);
                  
                  console.log('🎨 Moodboards Detailed Debug:', {
                    rawMoodboardsData: moodboardsData,
                    dataProperty: moodboardsData?.data,
                    dataDataProperty: moodboardsData?.data?.data,
                    isDataArray: Array.isArray(moodboardsData?.data),
                    isDataDataArray: Array.isArray(moodboardsData?.data?.data),
                    moodboardsArray: moodboardsArray,
                    moodboardsArrayWithIsActive: moodboardsArray.map((m: any) => ({ id: m._id, name: m.moodName, isActive: m.isActive })),
                    activeMoodboards: activeMoodboards
                  });

                  return activeMoodboards.length > 0 ? 
                    activeMoodboards.slice(0, 2).map((moodboard: Moodboard) => (
                      <div key={moodboard._id} className="p-3 bg-white/10 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {moodboard.imageUrl && (
                            <img 
                              src={moodboard.imageUrl} 
                              alt={moodboard.moodName}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <p className="font-medium text-romantic-charcoal">{moodboard.moodName}</p>
                            <p className="text-sm text-romantic-charcoal opacity-70">{moodboard.theme}</p>
                            <p className="text-xs text-green-600">Active: {moodboard.isActive ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-romantic-charcoal opacity-70 text-center py-4">No active moodboards</p>
                    );
                })()}
              </div>
            </div>

            {/* Recent Grievances */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-romantic-charcoal mb-4">Recent Grievances</h3>
              <div className="space-y-3">
                {(() => {
                  const grievancesArray = Array.isArray(grievancesData?.data) ? grievancesData?.data : 
                                         Array.isArray(grievancesData?.data?.data) ? grievancesData?.data?.data :
                                         Array.isArray(grievancesData) ? grievancesData : [];
                  
                  return grievancesArray.length > 0 ? 
                    grievancesArray.slice(0, 3).map((grievance: Grievance) => (
                    <div key={grievance._id} className="p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-romantic-charcoal">{grievance.title}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-romantic-charcoal opacity-70">
                            {'⭐'.repeat(grievance.rating)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            grievance.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {grievance.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-romantic-charcoal opacity-70">{formatDate(grievance.createdAt)}</p>
                    </div>
                  )) : (
                    <p className="text-romantic-charcoal opacity-70 text-center py-4">No recent grievances</p>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
