const mongoose = require('mongoose');
require('dotenv').config();

async function debugGrievances() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all grievances
    const Grievance = require('./dist/models/Grievance').default;
    const User = require('./dist/models/User').default;
    
    const allGrievances = await Grievance.find({}).sort({ createdAt: -1 });
    console.log('📊 Total grievances in database:', allGrievances.length);
    
    allGrievances.forEach((grievance, index) => {
      console.log(`\n${index + 1}. Grievance:`);
      console.log(`   ID: ${grievance._id}`);
      console.log(`   UserId: ${grievance.userId}`);
      console.log(`   PartnerId: ${grievance.partnerId}`);
      console.log(`   Title: ${grievance.title}`);
      console.log(`   Status: ${grievance.status}`);
      console.log(`   Category: ${grievance.category}`);
      console.log(`   Created: ${grievance.createdAt}`);
    });

    // Get users to see who has grievances
    const users = await User.find({});
    console.log('\n👥 Users in database:', users.length);
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User: ${user.firstName} ${user.lastName}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      
      // Check grievances for this user
      const userGrievances = allGrievances.filter(g => g.userId === user._id.toString());
      console.log(`   Grievances: ${userGrievances.length}`);
      userGrievances.forEach((g, gIndex) => {
        console.log(`     ${gIndex + 1}. ${g.title} (${g.status})`);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugGrievances(); 