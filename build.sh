#!/bin/bash

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Build backend
echo "Building backend..."
cd backend
npm install
npm run build
cd ..

echo "Build complete! 🚀" 