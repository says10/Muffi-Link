const mongoose = require('mongoose');
require('dotenv').config();

async function testGrievancesAPI() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get a user to test with
    const User = require('./dist/models/User').default;
    const user = await User.findOne();
    
    if (!user) {
      console.log('❌ No users found');
      return;
    }

    console.log('👤 Testing with user:', user._id);

    // Test the grievances query directly
    const Grievance = require('./dist/models/Grievance').default;
    const grievances = await Grievance.find({ userId: user._id.toString() })
      .populate('partnerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    console.log('📊 Grievances found:', grievances.length);
    grievances.forEach((grievance, index) => {
      console.log(`\n${index + 1}. Grievance:`);
      console.log(`   ID: ${grievance._id}`);
      console.log(`   Title: ${grievance.title}`);
      console.log(`   Status: ${grievance.status}`);
      console.log(`   Category: ${grievance.category}`);
      console.log(`   UserId: ${grievance.userId}`);
      console.log(`   PartnerId: ${grievance.partnerId}`);
    });

    // Simulate the API response structure
    const apiResponse = {
      success: true,
      data: grievances
    };

    console.log('\n📡 API Response Structure:');
    console.log(JSON.stringify(apiResponse, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testGrievancesAPI(); 