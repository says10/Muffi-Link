import mongoose from 'mongoose';
import User from '../models/User';
import Credit from '../models/Credit';
import Moodboard from '../models/Moodboard';

export const initializeUserData = async (userId: string) => {
  try {
    console.log('🚀 Initializing data for user:', userId);
    
    // Check if user has any credit records
    const creditBalance = await Credit.getBalance(userId);
    console.log('💰 Current balance:', creditBalance);
    
    // If balance is 0 or negative, it might mean no credits were initialized
    if (creditBalance <= 0) {
      console.log('💸 Balance is 0 or negative, initializing credits...');
      const user = await User.findById(userId);
      if (user) {
        // Give welcome credits based on whether they have a partner
        const welcomeAmount = user.partnerId ? 30 : 20;
        console.log(`🎁 Adding ${welcomeAmount} welcome credits...`);
        await Credit.addCredits(
          userId, 
          welcomeAmount, 
          'Welcome bonus - Account initialization 💕', 
          undefined, 
          'bonus'
        );
        console.log(`✅ Initialized ${welcomeAmount} credits for user ${userId}`);
      } else {
        console.log('❌ User not found for ID:', userId);
      }
    } else {
      console.log('✅ User already has credits:', creditBalance);
    }

    // Check if user has any moodboards
    const moodboardCount = await Moodboard.countDocuments({ userId });
    console.log('🎨 Current moodboard count:', moodboardCount);
    
    if (moodboardCount === 0) {
      console.log('🎨 No moodboards found, creating default moodboards...');
      
      const defaultMoodboards = [
        {
          userId,
          moodName: 'Romantic',
          description: 'Perfect for romantic evenings and intimate moments',
          theme: 'romantic',
          customText: 'Love is in the air ❤️',
          isActive: true,
          isDefault: true,
          backgroundColor: '#ff69b4',
          textColor: '#ffffff',
          emoji: '💕'
        },
        {
          userId,
          moodName: 'Playful',
          description: 'Fun and energetic activities together',
          theme: 'playful',
          customText: 'Let\'s have some fun! 🎉',
          isActive: false,
          isDefault: true,
          backgroundColor: '#ffa500',
          textColor: '#ffffff',
          emoji: '😄'
        },
        {
          userId,
          moodName: 'Calm',
          description: 'Peaceful and serene moments together',
          theme: 'calm',
          customText: 'Finding peace in each other 🕊️',
          isActive: false,
          isDefault: true,
          backgroundColor: '#87ceeb',
          textColor: '#ffffff',
          emoji: '🌅'
        }
      ];

      await Moodboard.insertMany(defaultMoodboards);
      console.log(`✅ Created ${defaultMoodboards.length} default moodboards for user ${userId}`);
    } else {
      console.log('✅ User already has moodboards:', moodboardCount);
    }

    return true;
  } catch (error) {
    console.error('❌ Error initializing user data:', error);
    return false;
  }
};

export const fixAllUsersData = async () => {
  try {
    const users = await User.find({});
    console.log(`Found ${users.length} users to check`);

    for (const user of users) {
      await initializeUserData(user._id.toString());
    }

    console.log('Finished initializing data for all users');
    return true;
  } catch (error) {
    console.error('Error fixing all users data:', error);
    return false;
  }
};

export const getUserStats = async (userId: string) => {
  try {
    const [creditBalance, moodboards, user] = await Promise.all([
      Credit.getBalance(userId),
      Moodboard.find({ userId }).sort({ createdAt: -1 }),
      User.findById(userId)
    ]);

    return {
      creditBalance,
      totalMoodboards: moodboards.length,
      activeMoodboards: moodboards.filter(m => m.isActive).length,
      hasPartner: !!user?.partnerId,
      userEmail: user?.email
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
};
