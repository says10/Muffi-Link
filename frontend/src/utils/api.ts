import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://muffi-link.onrender.com/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.message, error.response?.status);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (data: any) => api.post('/auth/signup', data),
  signin: (data: any) => api.post('/auth/signin', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Moodboard API calls
export const moodboardAPI = {
  getMoodboards: () => api.get('/moodboards'),
  getMoodboard: (id: string) => api.get(`/moodboards/${id}`),
  getMoodSuggestions: () => api.get('/moodboards/suggestions'),
  createMoodboard: (data: any) => api.post('/moodboards', data),
  updateMoodboard: (id: string, data: any) => api.put(`/moodboards/${id}`, data),
  deleteMoodboard: (id: string) => api.delete(`/moodboards/${id}`),
  selectMood: (id: string) => api.put(`/moodboards/${id}/select`),
  initializeMoodboards: () => api.post('/moodboards/initialize'),
  fixActiveStates: () => api.post('/moodboards/fix-active-states'),
  uploadMedia: (id: string, formData: FormData) => 
    api.post(`/moodboards/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Services API calls
export const servicesAPI = {
  getServices: () => api.get('/services'),
  createService: (data: any) => api.post('/services', data),
  bookService: (serviceId: string, bookingData: {
    date: string;
    time: string;
    moodboardId?: string;
    location?: string;
    notes?: string;
    serviceName?: string; // For custom services
    serviceDescription?: string; // For custom services
    creditCost?: number; // For custom services
  }) => api.post('/appointments', {
    serviceId,
    ...bookingData
  }),
  getBookings: () => api.get('/services/bookings'),
  updateService: (id: string, data: any) => api.put(`/services/${id}`, data),
  updateServiceStatus: (id: string, data: { status: string; rating?: number; feedback?: string }) => 
    api.put(`/services/${id}/status`, data),
  getService: (id: string) => api.get(`/services/${id}`),
  deleteService: (id: string) => api.delete(`/services/${id}`),
};

// Appointments API calls
export const appointmentsAPI = {
  getAppointments: () => api.get('/appointments'),
  createAppointment: (data: {
    serviceId: string;
    date: string;
    time: string;
    moodboardId?: string;
    location?: string;
    notes?: string;
    creditCost?: number;
    serviceName?: string;
    serviceDescription?: string;
    category?: string;
  }) => api.post('/appointments', data),
  getAppointment: (id: string) => api.get(`/appointments/${id}`),
  updateAppointment: (id: string, data: {
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    rating?: number;
    feedback?: string;
    date?: string;
    time?: string;
    location?: string;
    notes?: string;
  }) => api.put(`/appointments/${id}`, data),
  deleteAppointment: (id: string) => api.delete(`/appointments/${id}`),
  acceptAppointment: (id: string) => api.put(`/appointments/${id}/accept`),
  declineAppointment: (id: string) => api.put(`/appointments/${id}/decline`),
  updateAppointmentStatus: (id: string, data: { status: string; feedback?: string }) => api.put(`/appointments/${id}/status`, data),
};

// Love Notes API calls
export const loveNotesAPI = {
  sendLoveNote: (data: {
    receiverId: string;
    title: string;
    content: string;
    moodboardId?: string;
    expiresAt?: Date;
  }) => api.post('/love-notes', data),
  getReceivedLoveNotes: () => api.get('/love-notes/received'),
  getSentLoveNotes: () => api.get('/love-notes/sent'),
  getLoveNote: (id: string) => api.get(`/love-notes/${id}`),
  updateLoveNote: (id: string, data: {
    title?: string;
    content?: string;
    moodboardId?: string;
    isRead?: boolean;
    isFavorite?: boolean;
    expiresAt?: Date;
  }) => api.put(`/love-notes/${id}`, data),
  deleteLoveNote: (id: string) => api.delete(`/love-notes/${id}`),
  getUnreadCount: () => api.get('/love-notes/unread-count'),
};

// Memories API calls
export const memoriesAPI = {
  shareMemory: (data: {
    receiverId: string;
    title: string;
    description: string;
    memoryDate: Date;
    imageUrl?: string;
    videoUrl?: string;
    location?: string;
    moodboardId?: string;
    tags?: string[];
  }) => api.post('/memories', data),
  getReceivedMemories: () => api.get('/memories/received'),
  getSharedMemories: () => api.get('/memories/shared'),
  getMemory: (id: string) => api.get(`/memories/${id}`),
  updateMemory: (id: string, data: {
    title?: string;
    description?: string;
    memoryDate?: Date;
    imageUrl?: string;
    videoUrl?: string;
    location?: string;
    moodboardId?: string;
    isRead?: boolean;
    isFavorite?: boolean;
    tags?: string[];
  }) => api.put(`/memories/${id}`, data),
  deleteMemory: (id: string) => api.delete(`/memories/${id}`),
  getUnreadCount: () => api.get('/memories/unread-count'),
  getMemoriesByTag: (tag: string) => api.get(`/memories/tags/${tag}`),
};

// Credits API calls
export const creditsAPI = {
  getBalance: () => api.get('/credits/balance'),
  addCredits: (data: any) => api.post('/credits/add', data),
  deductCredits: (data: any) => api.post('/credits/deduct', data),
  getHistory: () => api.get('/credits/history'),
  getDebugStats: () => api.get('/credits/debug/stats'),
  initializeCredits: () => api.post('/credits/initialize'),
};

// Grievances API calls
export const grievancesAPI = {
  getGrievances: () => api.get('/grievances'),
  createGrievance: (data: any) => api.post('/grievances', data),
  updateGrievance: (id: string, data: any) => api.put(`/grievances/${id}`, data),
  rateGrievance: (id: string, data: any) => api.post(`/grievances/${id}/rate`, data),
};

// Appointment Rating API
export const appointmentRatingAPI = {
  rateAppointment: async (appointmentId: string, rating: number, feedback?: string) => {
    const response = await api.put(`/appointments/${appointmentId}/rate`, {
      rating,
      feedback
    });
    return response.data;
  },

  getAppointmentRating: async (appointmentId: string) => {
    const response = await api.get(`/appointments/${appointmentId}/rating`);
    return response.data;
  }
};

// Grievance API
export const grievanceAPI = {
  createGrievance: async (grievanceData: {
    subject: string;
    category: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    requestedAction?: string;
  }) => {
    const response = await api.post('/grievances', grievanceData);
    return response.data;
  },

  getGrievances: async () => {
    const response = await api.get('/grievances');
    return response.data;
  },

  getGrievance: async (grievanceId: string) => {
    const response = await api.get(`/grievances/${grievanceId}`);
    return response.data;
  },

  updateGrievance: async (grievanceId: string, updates: any) => {
    const response = await api.put(`/grievances/${grievanceId}`, updates);
    return response.data;
  },

  deleteGrievance: async (grievanceId: string) => {
    const response = await api.delete(`/grievances/${grievanceId}`);
    return response.data;
  }
};

export default api;
