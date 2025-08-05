const mongoose = require('mongoose');
require('dotenv').config();

// Default moodboards that every user gets when they sign up
const defaultMoodboards = [
  {
    moodName: 'Romantic',
    description: 'Perfect for romantic evenings and intimate moments',
    theme: 'Date Night',
    customText: 'Love is in the air ❤️',
    isActive: true,
    isDefault: true,
    backgroundColor: '#ff69b4',
    textColor: '#ffffff',
    emoji: '💕'
  },
  {
    moodName: 'Peaceful',
    description: 'Calm and serene moments together',
    theme: 'Quiet Time',
    customText: 'Finding peace in each other 🕊️',
    isActive: true,
    isDefault: true,
    backgroundColor: '#87ceeb',
    textColor: '#ffffff',
    emoji: '🌅'
  },
  {
    moodName: 'Playful',
    description: 'Fun and energetic activities',
    theme: 'Adventure Time',
    customText: 'Let\'s have some fun! 🎮',
    isActive: true,
    isDefault: true,
    backgroundColor: '#ffa500',
    textColor: '#ffffff',
    emoji: '🎉'
  },
  {
    moodName: 'Cozy',
    description: 'Warm and comfortable together',
    theme: 'Home Vibes',
    customText: 'Home is where you are 🏠',
    isActive: true,
    isDefault: true,
    backgroundColor: '#8B4513',
    textColor: '#ffffff',
    emoji: '🧸'
  },
  {
    moodName: 'Dreamy',
    description: 'Magical and whimsical moments',
    theme: 'Fantasy',
    customText: 'Living in our dreams ✨',
    isActive: true,
    isDefault: true,
    backgroundColor: '#9370db',
    textColor: '#ffffff',
    emoji: '✨'
  }
];

async function createDefaultMoodboards() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the first user (assuming they're logged in)
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    if (users.length === 0) {
      console.log('❌ No users found! Please sign up first.');
      return;
    }

    const user = users[0]; // Use first user
    console.log('👤 Creating moodboards for:', user.email);

    // Clear existing moodboards for this user
    await mongoose.connection.db.collection('moodboards').deleteMany({ userId: user._id });
    console.log('🧹 Cleared existing moodboards');

    // Create default moodboards for this user
    const moodboardsWithUserId = defaultMoodboards.map(mood => ({
      ...mood,
      userId: user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const result = await mongoose.connection.db.collection('moodboards').insertMany(moodboardsWithUserId);
    console.log(`🎨 Created ${Object.keys(result.insertedIds).length} default moodboards:`);
    
    defaultMoodboards.forEach(mood => {
      console.log(`  • ${mood.moodName} (${mood.theme}) - ${mood.emoji}`);
    });

    console.log('\n✨ Default moodboards created successfully!');
    console.log('📝 User can now:');
    console.log('   - See these moodboards in the service booking dropdown');
    console.log('   - Create 4-5 additional custom moodboards');
    console.log('   - Edit or delete these default ones if needed');

  } catch (error) {
    console.error('❌ Error creating default moodboards:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createDefaultMoodboards();
