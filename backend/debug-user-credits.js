const mongoose = require('mongoose');
require('dotenv').config();

async function debugUserCredits() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const User = require('./dist/models/User').default;
    const Credit = require('./dist/models/Credit').default;
    
    const users = await User.find({});
    console.log('👥 Total users:', users.length);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User: ${user.firstName} ${user.lastName}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
    });

    // Check all credit records
    const allCredits = await Credit.find({}).sort({ createdAt: -1 });
    console.log('\n📊 Total credit records:', allCredits.length);
    
    // Group credits by user
    const creditsByUser = {};
    allCredits.forEach(credit => {
      if (!creditsByUser[credit.userId]) {
        creditsByUser[credit.userId] = [];
      }
      creditsByUser[credit.userId].push(credit);
    });

    // Calculate balance for each user
    Object.keys(creditsByUser).forEach(userId => {
      const userCredits = creditsByUser[userId];
      let balance = 0;
      
      userCredits.forEach(credit => {
        if (credit.type === 'earned' || credit.type === 'refund') {
          balance += credit.amount;
        } else if (credit.type === 'spent' || credit.type === 'deducted') {
          balance -= credit.amount;
        }
      });
      
      console.log(`\n💰 User ${userId}:`);
      console.log(`   Balance: ${balance}`);
      console.log(`   Records: ${userCredits.length}`);
      userCredits.forEach((credit, index) => {
        console.log(`     ${index + 1}. ${credit.type}: ${credit.amount} - ${credit.reason}`);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugUserCredits(); 