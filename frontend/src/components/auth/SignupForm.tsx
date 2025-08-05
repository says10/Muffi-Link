import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthFormData } from '../../types';

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading, user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AuthFormData>();

  // Navigate to moodboards when user is successfully signed up
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/moodboards');
    }
  }, [user, isLoading, navigate]);

  const onSubmit = async (data: AuthFormData) => {
    try {
      console.log('Signup attempt with data:', data);
      await signup(data);
      // Don't navigate here - let the useEffect handle it
    } catch (error) {
      console.error('Signup error:', error);
      // Error is handled in the useAuth hook
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email Field */}
      <motion.div variants={inputVariants}>
        <label className="block text-sm font-medium text-romantic-charcoal mb-1">
          Email Address 💌
        </label>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          type="email"
          placeholder="your.love@example.com"
          className="romantic-input"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </motion.div>

      {/* Name Field */}
      <motion.div variants={inputVariants}>
        <label className="block text-sm font-medium text-romantic-charcoal mb-1">
          Full Name ✨
        </label>
        <input
          {...register('name', {
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters',
            },
          })}
          type="text"
          placeholder="Your beautiful name"
          className="romantic-input"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </motion.div>

      {/* Role Selection Field */}
      <motion.div variants={inputVariants}>
        <label className="block text-sm font-medium text-romantic-charcoal mb-2">
          I am a... 💕
        </label>
        <div className="grid grid-cols-1 gap-3">
          <label className="relative cursor-pointer">
            <input
              {...register('role', { required: 'Please select your role' })}
              type="radio"
              value="boyfriend"
              className="sr-only peer"
            />
            <div className="p-4 rounded-lg border-2 border-transparent bg-white/40 backdrop-blur-sm peer-checked:border-romantic-pink peer-checked:bg-romantic-pink/20 transition-all duration-200 hover:bg-white/60">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">👨‍❤️‍👨</span>
                <span className="font-medium text-romantic-charcoal">Boyfriend</span>
              </div>
            </div>
          </label>
          
          <label className="relative cursor-pointer">
            <input
              {...register('role', { required: 'Please select your role' })}
              type="radio"
              value="girlfriend"
              className="sr-only peer"
            />
            <div className="p-4 rounded-lg border-2 border-transparent bg-white/40 backdrop-blur-sm peer-checked:border-romantic-pink peer-checked:bg-romantic-pink/20 transition-all duration-200 hover:bg-white/60">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">👩‍❤️‍👩</span>
                <span className="font-medium text-romantic-charcoal">Girlfriend</span>
              </div>
            </div>
          </label>
          
          <label className="relative cursor-pointer">
            <input
              {...register('role', { required: 'Please select your role' })}
              type="radio"
              value="partner"
              className="sr-only peer"
            />
            <div className="p-4 rounded-lg border-2 border-transparent bg-white/40 backdrop-blur-sm peer-checked:border-romantic-pink peer-checked:bg-romantic-pink/20 transition-all duration-200 hover:bg-white/60">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">🏳️‍🌈</span>
                <span className="font-medium text-romantic-charcoal">Partner</span>
              </div>
            </div>
          </label>
        </div>
        {errors.role && (
          <p className="text-red-500 text-xs mt-2">{errors.role.message}</p>
        )}
        <p className="text-xs text-romantic-charcoal opacity-60 mt-2">
          Choose the role that best represents you in this beautiful relationship
        </p>
      </motion.div>

      {/* Password Field */}
      <motion.div variants={inputVariants}>
        <label className="block text-sm font-medium text-romantic-charcoal mb-1">
          Password 🔐
        </label>
        <input
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
              message: 'Password must contain uppercase, lowercase, number, and special character'
            }
          })}
          type="password"
          placeholder="Create a secure password"
          className="romantic-input"
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
        <p className="text-xs text-romantic-charcoal opacity-60 mt-1">
          Must include: uppercase, lowercase, number, and special character (@$!%*?&)
        </p>
      </motion.div>

      {/* Access Key Field */}
      <motion.div variants={inputVariants}>
        <label className="block text-sm font-medium text-romantic-charcoal mb-1">
          Access Key 🗝️
        </label>
        <input
          {...register('accessKey', {
            required: 'Access key is required',
            minLength: {
              value: 8,
              message: 'Access key must be at least 8 characters',
            },
          })}
          type="text"
          placeholder="Shared couple access key"
          className="romantic-input"
        />
        {errors.accessKey && (
          <p className="text-red-500 text-xs mt-1">{errors.accessKey.message}</p>
        )}
        <p className="text-xs text-romantic-charcoal opacity-60 mt-1">
          This key connects you with your partner
        </p>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        className="w-full romantic-gradient romantic-button mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Creating your account...
          </div>
        ) : (
          'Join Muffi-Link 💕'
        )}
      </motion.button>

      {/* Helper Text */}
      <p className="text-xs text-romantic-charcoal opacity-60 text-center mt-4">
        By signing up, you agree to share this beautiful journey with your partner
      </p>
    </form>
  );
};

export default SignupForm;
