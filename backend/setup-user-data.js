const mongoose = require('mongoose');
require('dotenv').config();

// Import the actual models
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isVerified: Boolean,
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  partnerCode: String,
  createdAt: { type: Date, default: Date.now }
});

const moodboardSchema = new mongoose.Schema({
  title: String,
  mood: String,
  moodName: String,
  theme: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: Date,
  selectedItems: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const serviceSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  creditCost: Number,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const creditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  type: String,
  reason: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Moodboard = mongoose.model('Moodboard', moodboardSchema);
const Service = mongoose.model('Service', serviceSchema);
const Credit = mongoose.model('Credit', creditSchema);

async function setupDataForAllUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find();
    console.log(`👥 Found ${users.length} users in database`);

    if (users.length === 0) {
      console.log('❌ No users found. Please log in first or create a user.');
      return;
    }

    // For each user, create sample data
    for (const user of users) {
      console.log(`\n🎯 Setting up data for user: ${user.name || user.email} (${user._id})`);

      // Clear existing data for this user
      await Moodboard.deleteMany({ userId: user._id });
      await Credit.deleteMany({ userId: user._id });
      
      // Create moodboards for this user
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
      console.log(`  🎨 Created ${createdMoodboards.length} moodboards`);

      // Create credits for this user
      const sampleCredits = [
        {
          userId: user._id,
          amount: 25,
          type: 'earned',
          reason: 'Welcome bonus - Promise Points to start your romantic journey! 💕',
          isActive: true
        },
        {
          userId: user._id,
          amount: 15,
          type: 'bonus',
          reason: 'Daily login bonus',
          isActive: true
        }
      ];

      const createdCredits = await Credit.insertMany(sampleCredits);
      const totalCredits = createdCredits.reduce((sum, credit) => sum + credit.amount, 0);
      console.log(`  💎 Created ${createdCredits.length} credit transactions (Total: ${totalCredits} points)`);
    }

    // Create global services (not user-specific)
    await Service.deleteMany({});
    const sampleServices = [
      {
        name: 'Romantic Dinner Date',
        description: 'Plan and execute a beautiful candlelit dinner for your partner',
        category: 'romantic',
        creditCost: 5,
        isActive: true
      },
      {
        name: 'Morning Coffee Surprise',
        description: 'Wake up early and prepare their favorite coffee with breakfast',
        category: 'thoughtful',
        creditCost: 2,
        isActive: true
      },
      {
        name: 'Weekend Getaway Planning',
        description: 'Research and book a surprise weekend trip',
        category: 'adventure',
        creditCost: 10,
        isActive: true
      },
      {
        name: 'Handwritten Love Letter',
        description: 'Write a heartfelt letter expressing your feelings',
        category: 'emotional',
        creditCost: 3,
        isActive: true
      },
      {
        name: 'Movie Night Setup',
        description: 'Create the perfect cozy movie night atmosphere',
        category: 'fun',
        creditCost: 4,
        isActive: true
      },
      {
        name: 'Flower Delivery',
        description: 'Send a beautiful bouquet to their workplace or home',
        category: 'romantic',
        creditCost: 6,
        isActive: true
      }
    ];

    const createdServices = await Service.insertMany(sampleServices);
    console.log(`\n💝 Created ${createdServices.length} global services`);

    console.log('\n✨ All sample data created successfully!');
    console.log('\n🎉 You should now see:');
    console.log('   - Services in the frontend');
    console.log('   - Moodboards in the booking dropdown');
    console.log('   - Updated Promise Points in the header');
    
  } catch (error) {
    console.error('❌ Error setting up data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

setupDataForAllUsers();
