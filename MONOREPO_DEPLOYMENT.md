# Muffi-Link Monorepo Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
1. **Connect to Vercel**: Link your GitHub repository
2. **Framework Preset**: Other
3. **Build Command**: `npm run vercel-build`
4. **Output Directory**: `frontend/build`
5. **Install Command**: `npm install`

### Option 2: Railway
1. **Connect to Railway**: Link your GitHub repository
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`

### Option 3: Render
1. **Connect to Render**: Link your GitHub repository
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`

## 🔧 Environment Variables

Add these to your deployment platform:

```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

## 📁 Project Structure

```
muffi-link/
├── frontend/          # React app
├── backend/           # Express API
├── package.json       # Root package.json
├── vercel.json        # Vercel config
└── build.sh          # Build script
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev

# Build for production
npm run build
```

## 🌐 How it works

- **Development**: Frontend runs on port 3000, backend on port 5001
- **Production**: Backend serves frontend static files
- **API Routes**: All API calls go to `/api/*`
- **Frontend Routes**: All other routes serve the React app

## ✅ Benefits

1. **No CORS issues** - Everything on same domain
2. **Simpler deployment** - One codebase
3. **Better performance** - No cross-origin requests
4. **Easier sharing** - Single URL to share 