const mongoose = require('mongoose');
require('dotenv').config();

async function debugCredits() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all credits and check their userId format
    const Credit = require('./dist/models/Credit').default;
    const allCredits = await Credit.find({}).sort({ createdAt: -1 });
    
    console.log('📊 Total credits in database:', allCredits.length);
    
    allCredits.forEach((credit, index) => {
      console.log(`\n${index + 1}. Credit Record:`);
      console.log(`   UserId: ${credit.userId}`);
      console.log(`   UserId type: ${typeof credit.userId}`);
      console.log(`   UserId constructor: ${credit.userId.constructor.name}`);
      console.log(`   Type: ${credit.type}`);
      console.log(`   Amount: ${credit.amount}`);
      console.log(`   Reason: ${credit.reason}`);
    });

    // Check if there are any credits with string userId
    const stringCredits = await Credit.find({ userId: { $type: "string" } });
    console.log('\n📊 Credits with string userId:', stringCredits.length);
    
    // Check if there are any credits with ObjectId userId
    const objectIdCredits = await Credit.find({ userId: { $type: "objectId" } });
    console.log('📊 Credits with ObjectId userId:', objectIdCredits.length);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugCredits(); 