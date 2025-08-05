#!/bin/bash

echo "🚀 Starting Vercel build..."

# Install dependencies for frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Go back to root
cd ..

# Install dependencies for backend
echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "✅ Build complete! Frontend built and ready to be served by backend." 