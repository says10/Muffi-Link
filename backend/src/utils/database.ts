import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/muffi-link';
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`
💕 MongoDB Connected Successfully! 💕
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 Host: ${conn.connection.host}
📁 Database: ${conn.connection.name}
🌟 Ready to store beautiful memories!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  } catch (error) {
    console.error('💔 MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('💔 MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('💔 MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('💕 MongoDB connection closed gracefully');
    process.exit(0);
  } catch (error) {
    console.error('💔 Error closing MongoDB connection:', error);
    process.exit(1);
  }
});
