const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

const User = require('../models/User');
const Exhibitor = require('../models/Exhibitor');
const Product = require('../models/Product');
const Session = require('../models/Session');
const Activity = require('../models/Activity');

dotenv.config({ path: '../../.env' });

const exhibitorsData = [
  {
    name: 'ABB',
    industry: 'Industrial Automation',
    booth: 'Hall B · Booth B-24',
    hall: 'Hall B',
    tagline: 'Powering safer, smarter factories.',
    verified: true,
    featured: true,
    logo: 'AB',
    categories: ['Automation', 'Manufacturing'],
    tags: ['Automation', 'Machinery']
  },
  {
    name: 'Siemens India',
    industry: 'Industrial Automation',
    country: '🇩🇪',
    booth: 'B-205',
    hall: 'Hall B',
    description: 'Integrated factory software, energy systems, and industrial automation for large-scale operations.',
    tags: ['Automation', 'Industrial IoT', 'Machinery'],
    categories: ['Automation', 'Manufacturing', 'Energy'],
    logo: 'SI',
    verified: true,
    featured: true,
  },
  {
    name: 'Tata Motors',
    industry: 'Automotive',
    country: '🇮🇳',
    booth: 'A-101',
    hall: 'Hall A',
    description: 'Electric mobility, connected vehicle platforms, and advanced manufacturing solutions.',
    tags: ['Automotive', 'EV', 'Mobility'],
    categories: ['Automotive', 'Manufacturing'],
    logo: 'TM',
    verified: true,
    featured: false,
  }
];

const sessionsData = [
  {
    time: '09:00 AM',
    title: 'Opening Keynote: The Future of Smart Industry',
    type: 'Keynote',
    color: '#1f7ae0',
    speaker: 'Sh. Piyush Goyal',
    hall: 'Main Auditorium',
    duration: '60 min',
    seats: '48 seats left',
    live: true,
  },
  {
    time: '10:30 AM',
    title: 'Robotics in Manufacturing Lines',
    type: 'Workshop',
    color: '#2ecc71',
    speaker: 'Dr. Priya Sharma',
    hall: 'Hall B',
    duration: '45 min',
    seats: '26 seats left',
    live: false,
  }
];

const productsData = [
  {
    name: 'EV Concept X1',
    category: 'Electric Vehicle',
    description: 'Tata Motors',
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7'
  },
  {
    name: 'SmartGrid Pro 5000',
    category: 'Energy Systems',
    description: 'Siemens India',
    imageUrl: 'https://images.unsplash.com/photo-1581092334884-5a2e5572e903'
  }
];

const importData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Exhibitor.deleteMany();
    await Product.deleteMany();
    await Session.deleteMany();
    await Activity.deleteMany();

    const createdExhibitors = await Exhibitor.insertMany(exhibitorsData);
    
    const productsWithExhibitor = productsData.map(p => ({
      ...p,
      exhibitorId: createdExhibitors[0]._id
    }));
    await Product.insertMany(productsWithExhibitor);

    await Session.insertMany(sessionsData);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

importData();
