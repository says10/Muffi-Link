import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthFormData } from '../../types';

type SigninFormData = {
  email: string;
  password: string;
  accessKey?: string;
};

const SigninForm: React.FC = () => {
  const navigate = useNavigate();
  const { signin, isLoading, user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>();

  // Navigate to moodboards when user is successfully signed in
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/moodboards');
    }
  }, [user, isLoading, navigate]);

  const onSubmit = async (data: SigninFormData) => {
    try {
      console.log('Signin attempt with data:', data);
      await signin(data);
      // Don't navigate here - let the useEffect handle it
    } catch (error) {
      console.error('Signin error:', error);
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
              message: 'Please enter a valid email address'
            }
          })}
          type="email"
          placeholder="Enter your email"
          className="romantic-input"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </motion.div>

      {/* Password Field */}
      <motion.div variants={inputVariants}>
        <label className="block text-sm font-medium text-romantic-charcoal mb-1">
          Password 🔐
        </label>
        <input
          {...register('password', {
            required: 'Password is required',
          })}
          type="password"
          placeholder="Enter your password"
          className="romantic-input"
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </motion.div>

      {/* Access Key Field (Optional) */}
      <motion.div variants={inputVariants}>
        <label className="block text-sm font-medium text-romantic-charcoal mb-1">
          Access Key 🗝️ <span className="text-xs opacity-60">(Optional)</span>
        </label>
        <input
          {...register('accessKey')}
          type="text"
          placeholder="Couple access key for verification"
          className="romantic-input"
        />
        <p className="text-xs text-romantic-charcoal opacity-60 mt-1">
          Use this to verify your couple connection
        </p>
      </motion.div>

      {/* Remember Me */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="remember"
          className="w-4 h-4 text-romantic-pink bg-white bg-opacity-50 border-romantic-pink rounded focus:ring-romantic-pink focus:ring-2"
        />
        <label htmlFor="remember" className="ml-2 text-sm text-romantic-charcoal">
          Remember me 💝
        </label>
      </div>

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
            Signing you in...
          </div>
        ) : (
          'Welcome Back 💕'
        )}
      </motion.button>

      {/* Forgot Password */}
      <div className="text-center mt-4">
        <button
          type="button"
          className="text-sm text-romantic-pink hover:text-romantic-rose transition-colors duration-200"
          onClick={() => {
            // TODO: Implement forgot password
          }}
        >
          Forgot your password? 🤔
        </button>
      </div>
    </form>
  );
};

export default SigninForm;
