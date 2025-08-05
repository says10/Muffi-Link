const mongoose = require('mongoose');
require('dotenv').config();

// Simple credit schema for seeding
const creditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  type: String,
  reason: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Credit = mongoose.model('Credit', creditSchema);

// Simple user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String
});

const User = mongoose.model('User', userSchema);

async function createSampleCredits() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create user
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: 'Sample User',
        email: 'user@example.com',
        role: 'user'
      });
      console.log('👤 Created sample user:', user._id);
    }

    // Clear existing credits
    await Credit.deleteMany({});
    console.log('🧹 Cleared existing credits');

    // Create sample credits (initial bonus)
    const sampleCredits = [
      {
        userId: user._id,
        amount: 20,
        type: 'earned',
        reason: 'Welcome bonus - Promise Points to start your romantic journey! 💕',
        isActive: true
      },
      {
        userId: user._id,
        amount: 10,
        type: 'bonus',
        reason: 'Daily login bonus',
        isActive: true
      }
    ];

    const createdCredits = await Credit.insertMany(sampleCredits);
    console.log(`💎 Created ${createdCredits.length} credit transactions:`);
    
    const totalCredits = createdCredits.reduce((sum, credit) => sum + credit.amount, 0);
    
    createdCredits.forEach(credit => {
      console.log(`  • +${credit.amount} credits - ${credit.reason}`);
    });

    console.log(`\n💰 Total credits for user: ${totalCredits} Promise Points`);
    console.log('\n✨ Sample credits created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample credits:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createSampleCredits();
