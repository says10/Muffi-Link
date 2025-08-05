# Vercel Deployment Guide for Muffi-Link Monorepo

## 🚀 Quick Deploy Steps

### 1. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `muffi-link` repository

### 2. Configure Build Settings
- **Framework Preset**: Other
- **Root Directory**: `./` (leave empty)
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `frontend/build`
- **Install Command**: `npm install`

### 3. Add Environment Variables
Add these in your Vercel project settings:

```
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-secure-jwt-secret-key
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 4. Deploy!
Click "Deploy" and wait for the build to complete.

## 🔧 How It Works

1. **Build Process**: 
   - Frontend builds to `frontend/build/`
   - Backend compiles TypeScript
   - Vercel serves the backend as serverless functions

2. **Routing**:
   - `/api/*` → Backend API routes
   - `/*` → Frontend React app (served by backend)

3. **Production Flow**:
   - User visits your domain
   - Backend serves React app
   - API calls go to `/api/*` endpoints

## 🛠️ Troubleshooting

### If build fails:
1. Check that all dependencies are in `package.json`
2. Ensure TypeScript compilation works
3. Verify environment variables are set

### If API calls fail:
1. Check CORS settings
2. Verify MongoDB connection
3. Ensure JWT_SECRET is set

### If frontend doesn't load:
1. Check that `frontend/build` exists
2. Verify static file serving in backend
3. Check Vercel function logs

## 📁 File Structure After Deploy

```
vercel-deployment/
├── frontend/build/     # Built React app
├── backend/dist/       # Compiled backend
└── vercel.json        # Vercel config
```

## ✅ Success Indicators

- ✅ Build completes without errors
- ✅ Frontend loads at your domain
- ✅ API calls work (test `/api/health`)
- ✅ Sign-in functionality works
- ✅ Database operations succeed

## 🔗 Useful Commands

```bash
# Test locally before deploy
npm run dev

# Build for production
npm run build

# Check Vercel logs
vercel logs
``` 