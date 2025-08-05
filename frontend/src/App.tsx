import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage';
import AppointmentsPage from './pages/AppointmentsPage';
import LoveNotesPage from './pages/LoveNotesPage';
import MemoriesPage from './pages/MemoriesPage';
import AccountabilityPage from './pages/AccountabilityPage';
import MoodboardPage from './pages/MoodboardPage';
import MoodboardDashboardPage from './pages/MoodboardDashboardPage';
import CreateMoodboardPage from './pages/CreateMoodboardPage';
import Navigation from './components/layout/Navigation';
import './index.css';
import GrievancesPage from './pages/GrievancesPage';

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-romantic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-romantic-charcoal">Loading... 💕</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="pb-20">
      {children}
      <Navigation />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#333',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
              }}
            />
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/signin" element={<Navigate to="/auth" replace />} />
              <Route path="/auth/signup" element={<Navigate to="/auth" replace />} />
              <Route path="/create-moodboard" element={
                <ProtectedRoute>
                  <CreateMoodboardPage />
                </ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/services" element={
                <ProtectedRoute>
                  <ServicesPage />
                </ProtectedRoute>
              } />
              <Route path="/appointments" element={
                <ProtectedRoute>
                  <AppointmentsPage />
                </ProtectedRoute>
              } />
              <Route path="/appointments/:id" element={
                <ProtectedRoute>
                  <AppointmentDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/love-notes" element={
                <ProtectedRoute>
                  <LoveNotesPage />
                </ProtectedRoute>
              } />
              <Route path="/memories" element={
                <ProtectedRoute>
                  <MemoriesPage />
                </ProtectedRoute>
              } />
              <Route path="/accountability" element={
                <ProtectedRoute>
                  <AccountabilityPage />
                </ProtectedRoute>
              } />
              <Route path="/grievances" element={
                <ProtectedRoute>
                  <GrievancesPage />
                </ProtectedRoute>
              } />
              <Route path="/moodboards" element={
                <ProtectedRoute>
                  <MoodboardPage />
                </ProtectedRoute>
              } />
              <Route path="/moodboards/:id" element={
                <ProtectedRoute>
                  <MoodboardDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/moodboards/create" element={
                <ProtectedRoute>
                  <CreateMoodboardPage />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
