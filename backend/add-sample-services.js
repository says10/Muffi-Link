const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Service schema (simple version)
const serviceSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  creditCost: Number,
  duration: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Service = mongoose.model('Service', serviceSchema);

const sampleServices = [
  {
    title: "Romantic Dinner Date",
    description: "Plan and execute a beautiful candlelit dinner with your partner's favorite meal",
    category: "romance",
    creditCost: 5,
    duration: "2-3 hours"
  },
  {
    title: "Movie Night Setup",
    description: "Create the perfect cozy movie night with snacks, blankets, and ambiance",
    category: "entertainment",
    creditCost: 3,
    duration: "1-2 hours"
  },
  {
    title: "Surprise Breakfast in Bed",
    description: "Wake up early to prepare and serve a delicious breakfast in bed",
    category: "caring",
    creditCost: 4,
    duration: "1 hour"
  },
  {
    title: "Weekend Getaway Planning",
    description: "Research and plan a romantic weekend getaway for both of you",
    category: "adventure",
    creditCost: 8,
    duration: "4-6 hours"
  },
  {
    title: "Handwritten Love Letter",
    description: "Write a heartfelt, romantic letter expressing your feelings",
    category: "romance",
    creditCost: 2,
    duration: "30 minutes"
  }
];

async function addSampleServices() {
  try {
    console.log('🌟 Adding sample services...');
    
    // Clear existing services
    await Service.deleteMany({});
    console.log('🧹 Cleared existing services');
    
    // Add new services
    const createdServices = await Service.insertMany(sampleServices);
    console.log(`✅ Added ${createdServices.length} sample services!`);
    
    createdServices.forEach(service => {
      console.log(`💕 ${service.title} - ${service.creditCost} credits`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding services:', error);
    process.exit(1);
  }
}

mongoose.connection.once('open', () => {
  console.log('🔗 Connected to MongoDB');
  addSampleServices();
});
