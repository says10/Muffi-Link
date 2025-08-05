const mongoose = require('mongoose');
require('dotenv').config();

// Simple moodboard schema for seeding
const moodboardSchema = new mongoose.Schema({
  title: String,
  mood: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: Date,
  moodName: String,
  theme: String,
  selectedItems: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Moodboard = mongoose.model('Moodboard', moodboardSchema);

// Simple user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String
});

const User = mongoose.model('User', userSchema);

async function createSampleMoodboards() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user exists, if not create one
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: 'Sample User',
        email: 'user@example.com',
        role: 'user'
      });
      console.log('👤 Created sample user:', user._id);
    }

    // Clear existing moodboards
    await Moodboard.deleteMany({});
    console.log('🧹 Cleared existing moodboards');

    // Create sample moodboards
    const sampleMoodboards = [
      {
        title: 'Romantic Evening',
        mood: 'romantic',
        moodName: 'Romantic',
        theme: 'Date Night',
        userId: user._id,
        date: new Date(),
        selectedItems: ['candlelight', 'roses', 'wine'],
        isActive: true
      },
      {
        title: 'Cozy Morning',
        mood: 'peaceful',
        moodName: 'Peaceful',
        theme: 'Morning Vibes',
        userId: user._id,
        date: new Date(),
        selectedItems: ['coffee', 'blanket', 'sunshine'],
        isActive: true
      },
      {
        title: 'Adventure Day',
        mood: 'exciting',
        moodName: 'Exciting',
        theme: 'Outdoor Fun',
        userId: user._id,
        date: new Date(),
        selectedItems: ['hiking', 'picnic', 'nature'],
        isActive: true
      },
      {
        title: 'Intimate Dinner',
        mood: 'passionate',
        moodName: 'Passionate',
        theme: 'Fine Dining',
        userId: user._id,
        date: new Date(),
        selectedItems: ['gourmet', 'champagne', 'music'],
        isActive: true
      }
    ];

    const createdMoodboards = await Moodboard.insertMany(sampleMoodboards);
    console.log(`🎨 Created ${createdMoodboards.length} sample moodboards:`);
    
    createdMoodboards.forEach(moodboard => {
      console.log(`  • ${moodboard.title} (${moodboard.mood}) - ID: ${moodboard._id}`);
    });

    console.log('\n✨ Sample moodboards created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample moodboards:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createSampleMoodboards();
