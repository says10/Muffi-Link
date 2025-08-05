export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: 'boyfriend' | 'girlfriend' | 'partner';
  partnerId?: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    role: 'boyfriend' | 'girlfriend' | 'partner';
    lastLogin?: string;
  };
  relationshipStartDate?: string;
  partnerEmail?: string;
  credits: number;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
  anniversaryDate?: string;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Moodboard {
  _id: string;
  userId: string;
  moodName: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  customText: string;
  theme: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  userId: string;
  partnerId: string;
  moodboardId?: string;
  moodboard?: Moodboard; // Populated moodboard data
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  creditCost: number;
  duration: string;
  isCustom: boolean;
  category: 'date' | 'gift' | 'activity' | 'surprise' | 'help' | 'custom' | 'love_note' | 'memory';
  location?: string;
  notes?: string;
  completedAt?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCatalog {
  _id: string;
  name: string;
  description: string;
  category: 'date' | 'gift' | 'activity' | 'surprise' | 'help' | 'custom' | 'love_note' | 'memory';
  creditCost: number;
  duration: string;
  isCustom: boolean;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoveNote {
  _id: string;
  senderId: string;
  receiverId: string;
  title: string;
  content: string;
  moodboardId?: string;
  isRead: boolean;
  isFavorite: boolean;
  expiresAt?: string;
  sender?: User;
  receiver?: User;
  moodboard?: Moodboard;
  createdAt: string;
  updatedAt: string;
}

export interface Memory {
  _id: string;
  senderId: string;
  receiverId: string;
  title: string;
  description: string;
  memoryDate: string;
  imageUrl?: string;
  videoUrl?: string;
  location?: string;
  moodboardId?: string;
  isRead: boolean;
  isFavorite: boolean;
  tags: string[];
  sender?: User;
  receiver?: User;
  moodboard?: Moodboard;
  createdAt: string;
  updatedAt: string;
}

export interface Credit {
  _id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent' | 'deducted';
  reason: string;
  relatedId?: string;
  createdAt: string;
}

export interface Grievance {
  _id: string;
  userId: string;
  partnerId: string;
  title: string;
  subject?: string; // Alias for title for compatibility
  description: string;
  rating: number;
  creditImpact: number;
  status: 'pending' | 'resolved' | 'dismissed' | 'open'; // Added 'open' for compatibility
  category: 'communication' | 'behavior' | 'responsibility' | 'affection' | 'time' | 'other';
  severity: 'low' | 'medium' | 'high';
  priority?: 'low' | 'medium' | 'high'; // Added priority field
  requestedAction?: string; // Added requestedAction field
  response?: string; // Added response field (alias for responseText)
  responseText?: string;
  resolvedAt?: string;
  isAnonymous: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthFormData {
  name: string;
  email?: string;
  password: string;
  accessKey: string;
  role: 'boyfriend' | 'girlfriend' | 'partner';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface MoodOption {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}
