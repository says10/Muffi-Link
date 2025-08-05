const mongoose = require('mongoose');
const uri = 'mongodb+srv://sayantanmukherjee0010:Sayantan%402003@cluster0.i5qwrvh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri).then(() => {
  console.log('Connected to MongoDB');
  
  const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    userId: { type: String, required: true },
    partnerId: { type: String, required: true },
    moodboardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Moodboard', default: null },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    creditCost: { type: Number, required: true },
    isCustom: { type: Boolean, default: true },
    category: { type: String, enum: ['date', 'gift', 'activity', 'surprise', 'help', 'custom'], required: true },
    location: String,
    notes: String
  }, { timestamps: true });
  
  const Service = mongoose.model('Service', serviceSchema);
  
  // Sample services data
  const sampleServices = [
    {
      name: 'Romantic Dinner Date',
      description: 'A beautiful candlelit dinner at a romantic restaurant with your favorite cuisine',
      date: new Date('2025-08-10'),
      time: '19:00',
      userId: '688f1a9c7b9d6a1099c28df1',
      partnerId: '688f1a9c7b9d6a1099c28df1',
      creditCost: 25,
      category: 'date',
      location: 'Romantic Restaurant Downtown',
      notes: 'Perfect for anniversary celebrations'
    },
    {
      name: 'Movie Night Package',
      description: 'Cozy movie night with popcorn, snacks, and your favorite films',
      date: new Date('2025-08-12'),
      time: '20:00',
      userId: '688f1a9c7b9d6a1099c28df1',
      partnerId: '688f1a9c7b9d6a1099c28df1',
      creditCost: 15,
      category: 'activity',
      location: 'At Home',
      notes: 'Includes all snacks and drinks'
    },
    {
      name: 'Surprise Gift Box',
      description: 'Curated surprise box with thoughtful gifts and love notes',
      date: new Date('2025-08-15'),
      time: '14:00',
      userId: '688f1a9c7b9d6a1099c28df1',
      partnerId: '688f1a9c7b9d6a1099c28df1',
      creditCost: 30,
      category: 'gift',
      location: 'Home Delivery',
      notes: 'Personalized with your relationship memories'
    },
    {
      name: 'Spa Day Experience',
      description: 'Relaxing spa day with massages, facials, and wellness treatments',
      date: new Date('2025-08-18'),
      time: '11:00',
      userId: '688f1a9c7b9d6a1099c28df1',
      partnerId: '688f1a9c7b9d6a1099c28df1',
      creditCost: 50,
      category: 'surprise',
      location: 'Luxury Spa Center',
      notes: 'Full day relaxation package'
    },
    {
      name: 'Cooking Class Together',
      description: 'Learn to cook a new cuisine together with a professional chef',
      date: new Date('2025-08-20'),
      time: '16:00',
      userId: '688f1a9c7b9d6a1099c28df1',
      partnerId: '688f1a9c7b9d6a1099c28df1',
      creditCost: 35,
      category: 'activity',
      location: 'Culinary School',
      notes: 'Includes all ingredients and recipes'
    },
    {
      name: 'Help with Household Tasks',
      description: 'Complete assistance with household chores and organization',
      date: new Date('2025-08-22'),
      time: '10:00',
      userId: '688f1a9c7b9d6a1099c28df1',
      partnerId: '688f1a9c7b9d6a1099c28df1',
      creditCost: 10,
      category: 'help',
      location: 'At Home',
      notes: 'Full house cleaning and organization'
    }
  ];
  
  // Insert sample services
  Service.insertMany(sampleServices).then((result) => {
    console.log(`✅ Created ${result.length} sample services!`);
    console.log('Sample services:', result.map(s => ({ name: s.name, category: s.category, cost: s.creditCost })));
    mongoose.connection.close();
  }).catch(err => {
    console.error('Error creating services:', err);
    mongoose.connection.close();
  });
}).catch(err => {
  console.error('Connection error:', err);
});
