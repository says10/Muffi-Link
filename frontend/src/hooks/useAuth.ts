import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { User, AuthFormData } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signup: (data: AuthFormData) => Promise<void>;
  signin: (data: { email: string; password: string; accessKey?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Get current user
  const { data: userResponse, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      if (!token) return null;
      const response = await authAPI.me();
      return response.data;
    },
    enabled: !!token,
    retry: false,
  });

  // Extract user data from the response
  const user = userResponse?.data?.user || null;

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: authAPI.signup,
    onSuccess: (response: any) => {
      const { token: newToken, data } = response.data;
      const { user } = data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      queryClient.setQueryData(['user'], { data: { user } });
      toast.success('Welcome to Muffi-Link! 💕');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Signup failed');
    },
  });

  // Signin mutation
  const signinMutation = useMutation({
    mutationFn: authAPI.signin,
    onSuccess: (response: any) => {
      const { token: newToken, data } = response.data;
      const { user } = data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      queryClient.setQueryData(['user'], { data: { user } });
      toast.success(`Welcome back, ${user.firstName}! 💕`);
    },
    onError: (error: any) => {
      console.error('Signin error details:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Signin failed');
    },
  });

  const signup = async (data: AuthFormData) => {
    await signupMutation.mutateAsync(data);
  };

  const signin = async (data: { email: string; password: string; accessKey?: string }) => {
    // Only send email and password to the backend
    console.log('Signin function called with:', data);
    const payload = {
      email: data.email,
      password: data.password
    };
    console.log('Sending payload to API:', payload);
    await signinMutation.mutateAsync(payload);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    queryClient.clear();
    toast.success('Goodbye! See you soon 👋');
  };

  const contextValue: AuthContextType = {
    user: user || null,
    isLoading: isLoading || signupMutation.isPending || signinMutation.isPending,
    signup,
    signin,
    logout,
  };

  return React.createElement(AuthContext.Provider, { value: contextValue }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
