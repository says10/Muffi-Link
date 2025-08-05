# Muffi-Link - Relationship Management Platform

A comprehensive platform for couples to manage their relationship through grievances, credits, services, and mood tracking.

## Backend Requirements

### 1. Authentication System
- **Signup/Signin**: Push data into backend database
- **Access Control**: Username and access key authentication
- **Partner Linking**: Same access key can be used by max 2 people (couples)
- **Database Storage**: User credentials, access codes, and partner relationships

### 2. Customizable Moodboard
- **Image/Video Upload**: Support for media files via Cloudinary API
- **Text Customization**: Editable text content for each mood
- **Database Storage**: Mood configurations, media URLs, and custom text
- **Real-time Updates**: Sync mood changes between partners

### 3. Services Management
- **Service Database**: Store service name, date, and time
- **Booking System**: Allow users to book services
- **Service History**: Track all booked services
- **Credit Integration**: Services can cost credits

### 4. Credit System
- **Credit Tracking**: Add/subtract credits based on actions
- **Balance Management**: Real-time credit balance updates
- **Transaction History**: Log all credit changes
- **Rating Integration**: Credits affected by grievance ratings

### 5. Grievance/Complaint System
- **Text Format**: Store grievances as text content
- **Rating System**: Rate grievances (affects credit calculations)
- **Credit Impact**: Ratings determine credit subtraction/addition
- **History Tracking**: Maintain grievance history

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  hashedAccessKey: String,
  role: String, // 'boyfriend' | 'girlfriend'
  partnerId: ObjectId,
  partnerEmail: String,
  credits: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Moodboards Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  moodName: String,
  description: String,
  imageUrl: String,
  videoUrl: String,
  customText: String,
  theme: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Services Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  date: Date,
  time: String,
  userId: ObjectId,
  partnerId: ObjectId,
  status: String, // 'pending' | 'confirmed' | 'completed'
  createdAt: Date,
  updatedAt: Date
}
```

### Credits Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  amount: Number,
  type: String, // 'earned' | 'spent' | 'deducted'
  reason: String,
  relatedId: ObjectId, // Reference to service/grievance
  createdAt: Date
}
```

### Grievances Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  partnerId: ObjectId,
  title: String,
  description: String,
  rating: Number, // 1-5 scale
  creditImpact: Number,
  status: String, // 'pending' | 'resolved'
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Moodboards
- `GET /api/moodboards` - Get user's moodboards
- `POST /api/moodboards` - Create new moodboard
- `PUT /api/moodboards/:id` - Update moodboard
- `DELETE /api/moodboards/:id` - Delete moodboard
- `POST /api/moodboards/:id/upload` - Upload media

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Book a service
- `GET /api/services/bookings` - Get user bookings
- `PUT /api/services/:id` - Update service booking

### Credits
- `GET /api/credits/balance` - Get credit balance
- `POST /api/credits/add` - Add credits
- `POST /api/credits/deduct` - Deduct credits
- `GET /api/credits/history` - Get credit history

### Grievances
- `GET /api/grievances` - Get grievances
- `POST /api/grievances` - Create grievance
- `PUT /api/grievances/:id` - Update grievance
- `POST /api/grievances/:id/rate` - Rate grievance

## Technology Stack

### Backend
- Node.js with Express.js
- TypeScript for type safety
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Cloudinary for media uploads
- Multer for file handling

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Axios for API calls
- React Router for navigation

## Setup Instructions

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Environment Variables**
   - Create `.env` files for both frontend and backend
   - Configure MongoDB connection string
   - Set up Cloudinary credentials
   - Configure JWT secret

## Features

- **Beautiful Animations**: Smooth transitions and micro-interactions
- **Glass Morphism Design**: Modern, elegant UI
- **Real-time Sync**: Changes reflect immediately between partners
- **Credit System**: Gamified relationship management
- **Media Support**: Image and video uploads
- **Responsive Design**: Works on all devices
