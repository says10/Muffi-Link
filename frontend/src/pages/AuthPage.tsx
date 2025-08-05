import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';
import SigninForm from '../components/auth/SigninForm';

const AuthPage: React.FC = () => {
  const [isSignup, setIsSignup] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-romantic-pink opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-romantic-rose opacity-20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-romantic-lavender opacity-10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl font-romantic text-romantic-gradient mb-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Muffi-Link 💕
          </motion.h1>
          <motion.p
            className="text-romantic-charcoal opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Where love meets technology
          </motion.p>
        </div>

        {/* Auth Form Container */}
        <motion.div
          className="glass-card rounded-2xl p-8 shadow-romantic"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Tab Switcher */}
          <div className="flex mb-6 bg-white bg-opacity-30 rounded-xl p-1">
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                isSignup
                  ? 'bg-white text-romantic-charcoal shadow-sm'
                  : 'text-romantic-charcoal opacity-70 hover:opacity-100'
              }`}
              onClick={() => setIsSignup(true)}
            >
              Sign Up
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                !isSignup
                  ? 'bg-white text-romantic-charcoal shadow-sm'
                  : 'text-romantic-charcoal opacity-70 hover:opacity-100'
              }`}
              onClick={() => setIsSignup(false)}
            >
              Sign In
            </button>
          </div>

          {/* Form Content */}
          <motion.div
            key={isSignup ? 'signup' : 'signin'}
            initial={{ opacity: 0, x: isSignup ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isSignup ? -20 : 20 }}
            transition={{ duration: 0.3 }}
          >
            {isSignup ? <SignupForm /> : <SigninForm />}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-romantic-charcoal opacity-60 mt-6 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Built with 💕 for couples everywhere
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
