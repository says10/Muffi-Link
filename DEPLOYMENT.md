# Deployment Guide for Muffi-Link

This guide will help you deploy your Muffi-Link project to GitHub and other platforms.

## ⚠️ **IMPORTANT: Backend Architecture**

Your backend is a **traditional Express.js server** (NOT serverless), which means:
- ✅ **Works on**: Railway, Render, Heroku, DigitalOcean
- ❌ **Does NOT work on**: Vercel (serverless only)

## Prerequisites

1. **Git** installed on your system
2. **GitHub account** 
3. **Node.js** and **npm** installed
4. **MongoDB** database (local or cloud)

## Step 1: Initialize Git Repository

If you haven't already initialized a Git repository:

```bash
# Navigate to your project root
cd muffi-link

# Initialize Git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Muffi-Link relationship management platform"
```

## Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository (e.g., "muffi-link")
5. Make it public or private (your choice)
6. **Don't** initialize with README, .gitignore, or license (since we already have these)
7. Click "Create repository"

## Step 3: Connect Local Repository to GitHub

After creating the GitHub repository, you'll see instructions. Run these commands:

```bash
# Add the remote origin (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

Add the following variables to `backend/.env`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/muffi-link
# or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/muffi-link

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# Cloudinary Configuration (for media uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
touch .env
```

Add the following variables to `frontend/.env`:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000/api

# Cloudinary Configuration
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## Step 5: Deploy Backend (Traditional Server)

### Option A: Deploy to Railway (Recommended)

1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `backend` folder
4. Add environment variables in the Railway dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret
   - `NODE_ENV`: production
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
   - `FRONTEND_URL`: Your frontend URL
5. Deploy

### Option B: Deploy to Render

1. Go to [Render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy

### Option C: Deploy to Heroku

1. **Install Heroku CLI** and login:
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku app**:
   ```bash
   cd backend
   heroku create your-app-name
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set MONGODB_URI=your-mongodb-atlas-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set NODE_ENV=production
   heroku config:set CLOUDINARY_CLOUD_NAME=your-cloud-name
   heroku config:set CLOUDINARY_API_KEY=your-api-key
   heroku config:set CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy backend to Heroku"
   git push heroku main
   ```

## Step 6: Deploy Frontend (Static Site)

### Option A: Deploy to Vercel (Recommended)

1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set the root directory to `frontend`
4. Add environment variables:
   - `REACT_APP_API_URL`: Your backend URL (e.g., https://your-app.railway.app/api)
   - `REACT_APP_CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `REACT_APP_CLOUDINARY_UPLOAD_PRESET`: Your upload preset
5. Deploy

### Option B: Deploy to Netlify

1. Go to [Netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Set build settings:
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/build`
4. Add environment variables in the Netlify dashboard
5. Deploy

### Option C: Deploy to GitHub Pages

1. **Update package.json** in the frontend directory:
   ```json
   {
     "homepage": "https://your-username.github.io/your-repo-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

2. **Install gh-pages**:
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

## Step 7: Update Frontend API URL

After deploying your backend, update the frontend environment variables to point to your deployed backend URL.

## Step 8: Database Setup

### MongoDB Atlas (Recommended for Production)

1. Create a free account at [MongoDB Atlas](https://mongodb.com/atlas)
2. Create a new cluster
3. Set up database access (username/password)
4. Set up network access (IP whitelist - add 0.0.0.0/0 for all IPs)
5. Get your connection string
6. Update your backend environment variables

### Local MongoDB

For development, you can use a local MongoDB instance:

```bash
# Install MongoDB locally
# On macOS: brew install mongodb-community
# On Windows: Download from mongodb.com
# On Ubuntu: sudo apt install mongodb

# Start MongoDB service
mongod
```

## Step 9: Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1.0.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your backend CORS settings include your frontend URL
2. **Environment Variables**: Double-check all environment variables are set correctly
3. **Build Errors**: Check that all dependencies are installed
4. **Database Connection**: Verify your MongoDB connection string is correct
5. **Port Issues**: Make sure your backend uses `process.env.PORT` for production

### Useful Commands

```bash
# Check Git status
git status

# View commit history
git log --oneline

# Check remote repositories
git remote -v

# Pull latest changes
git pull origin main

# View environment variables (Heroku)
heroku config

# View logs (Heroku)
heroku logs --tail
```

## Security Considerations

1. **Never commit `.env` files** - they're already in `.gitignore`
2. **Use strong JWT secrets** - generate random strings
3. **Enable HTTPS** - most deployment platforms do this automatically
4. **Set up proper CORS** - only allow your frontend domain
5. **Use environment variables** for all sensitive data

## Next Steps

After deployment:

1. Test all features thoroughly
2. Set up monitoring and logging
3. Configure custom domain (optional)
4. Set up SSL certificates
5. Implement backup strategies for your database

Your Muffi-Link application should now be live and accessible to users! 