import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PromisePointsHeader from '../PromisePointsHeader';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/services', label: 'Services', icon: '💕' },
    { path: '/appointments', label: 'Appointments', icon: '📅' },
    { path: '/moodboards', label: 'Moodboards', icon: '🎨' },
    { path: '/accountability', label: 'Accountability', icon: '📊' },
    { path: '/grievances', label: 'Grievances', icon: '⚖️' },
    // { path: '/love-notes', label: 'Love Notes', icon: '💌' }, // Moved to sidebar
    // { path: '/memories', label: 'Memories', icon: '📸' }, // Moved to sidebar
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Promise Points Header */}
      <PromisePointsHeader />
      
      {/* Bottom Navigation */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm border-t border-white/20 z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-romantic-pink/20 text-romantic-pink'
                      : 'text-romantic-charcoal/70 hover:text-romantic-pink hover:bg-romantic-pink/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.button>
              );
            })}
            
            {/* Logout Button */}
            <motion.button
              onClick={handleLogout}
              className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-romantic-charcoal/70 hover:text-red-500 hover:bg-red-50/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl">🚪</span>
              <span className="text-xs font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default Navigation;