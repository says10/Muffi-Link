const mongoose = require('mongoose');
require('dotenv').config();

// Import the models
const Credit = require('./dist/models/Credit').default;
const User = require('./dist/models/User').default;

async function testCredits() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a user (you can replace this with a specific user ID)
    const user = await User.findOne();
    
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('👤 Testing with user:', user._id);

    // Check current balance
    const currentBalance = await Credit.getBalance(user._id.toString());
    console.log('💰 Current balance:', currentBalance);

    // Get all credit records
    const allCredits = await Credit.find({ userId: user._id }).sort({ createdAt: -1 });
    console.log('📊 Total credit records:', allCredits.length);
    
    allCredits.forEach((credit, index) => {
      console.log(`  ${index + 1}. Type: ${credit.type}, Amount: ${credit.amount}, Reason: ${credit.reason}`);
    });

    // Add some test credits if balance is 0
    if (currentBalance === 0) {
      console.log('🎁 Adding test credits...');
      
      await Credit.createTransaction({
        userId: user._id,
        amount: 50,
        type: 'earned',
        reason: 'Test credit addition',
        relatedType: 'bonus'
      });

      const newBalance = await Credit.getBalance(user._id.toString());
      console.log('💰 New balance after adding credits:', newBalance);
    }

    console.log('✅ Test completed');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testCredits(); 