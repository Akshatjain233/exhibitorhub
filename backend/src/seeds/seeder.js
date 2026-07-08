const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const Exhibition = require('../models/Exhibition');
const Organizer = require('../models/Organizer');
const Exhibitor = require('../models/Exhibitor');
const Product = require('../models/Product');
const Session = require('../models/Session');
const Sponsor = require('../models/Sponsor');
const Announcement = require('../models/Announcement');
const PlatformSetting = require('../models/PlatformSetting');
const ROLES = require('../constants/roles');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const localVisitorEmail = process.env.DUMMY_VISITOR_EMAIL || 'user@gmail.com';
const localVisitorPassword = process.env.DUMMY_VISITOR_PASSWORD || 'user123';
const localExhibitorEmail = process.env.DUMMY_EXHIBITOR_EMAIL || 'exhibitor@exhibitorhub.com';
const localExhibitorPassword = process.env.DUMMY_EXHIBITOR_PASSWORD || 'password123';

const forceSeed = process.argv.includes('--force') || process.env.FORCE_SEED === 'true';

const seedData = async () => {
  try {
    await connectDB();

    if (!forceSeed) {
      const dummyAccountsExist = await User.exists({
        email: { $in: [localVisitorEmail, localExhibitorEmail] },
      });
      if (dummyAccountsExist) {
        console.log('Seeded dummy accounts already exist, skipping seed (use --force to reseed).');
        process.exit(0);
      }
    }

    // Clear DB
    await Promise.all([
      User.deleteMany(), Exhibition.deleteMany(), Organizer.deleteMany(),
      Exhibitor.deleteMany(), Product.deleteMany(), Session.deleteMany(),
      Sponsor.deleteMany(), Announcement.deleteMany(), PlatformSetting.deleteMany()
    ]);

    // Create Users
    const superAdmin = await User.create({ email: 'super@exhibitorhub.com', password: 'password123', role: ROLES.SUPER_ADMIN });
    const admin = await User.create({ email: 'admin@exhibitorhub.com', password: 'password123', role: ROLES.EXHIBITION_ADMIN });
    const exhibitorUser = await User.create({ email: localExhibitorEmail, password: localExhibitorPassword, role: ROLES.EXHIBITOR });
    const visitor = await User.create({ email: localVisitorEmail, password: localVisitorPassword, role: ROLES.VISITOR });

    console.log('Seeded local login accounts:');
    console.log(`Visitor   -> ${localVisitorEmail} / ${localVisitorPassword}`);
    console.log(`Exhibitor -> ${localExhibitorEmail} / ${localExhibitorPassword}`);

    // Create Organizer & Exhibition
    const organizer = await Organizer.create({ name: 'Global Tech Events', contactEmail: 'contact@globaltech.com' });
    const exhibition = await Exhibition.create({
      name: 'India Manufacturing Expo 2026',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-05'),
      venue: 'Pragati Maidan, New Delhi',
      organizerId: organizer._id
    });

    // Create Platform Settings
    await PlatformSetting.create({ key: 'MAINTENANCE_MODE', value: false });

    // Create Exhibitors
    const exhibitors = await Exhibitor.insertMany([
      { name: 'ABB', industry: 'Industrial Automation', booth: 'Hall B · Booth B-24', hall: 'Hall B', tagline: 'Powering safer factories.', verified: true, featured: true, logo: 'AB', categories: ['Automation'], tags: ['Automation'] },
      { name: 'Siemens India', industry: 'Industrial Automation', country: '🇩🇪', booth: 'B-205', hall: 'Hall B', description: 'Integrated factory software.', tags: ['Automation'], categories: ['Automation'], logo: 'SI', verified: true, featured: true },
      { name: 'Tata Motors', industry: 'Automotive', country: '🇮🇳', booth: 'A-101', hall: 'Hall A', description: 'Electric mobility.', tags: ['Automotive'], categories: ['Automotive'], logo: 'TM', verified: true, featured: false }
    ]);

    // Create Products
    await Product.insertMany([
      { name: 'EV Concept X1', category: 'Electric Vehicle', description: 'Tata Motors', imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7', exhibitorId: exhibitors[2]._id },
      { name: 'SmartGrid Pro 5000', category: 'Energy Systems', description: 'Siemens India', imageUrl: 'https://images.unsplash.com/photo-1581092334884-5a2e5572e903', exhibitorId: exhibitors[1]._id }
    ]);

    // Create Sessions
    await Session.insertMany([
      { time: '09:00 AM', title: 'Opening Keynote: The Future of Smart Industry', type: 'Keynote', color: '#1f7ae0', speaker: 'Sh. Piyush Goyal', hall: 'Main Auditorium', duration: '60 min', seats: '48 seats left', live: true },
      { time: '10:30 AM', title: 'Robotics in Manufacturing Lines', type: 'Workshop', color: '#2ecc71', speaker: 'Dr. Priya Sharma', hall: 'Hall B', duration: '45 min', seats: '26 seats left', live: false }
    ]);

    // Create Sponsors
    await Sponsor.create({ name: 'Tech Mahindra', tier: 'Platinum', exhibitionId: exhibition._id });

    // Create Announcement
    await Announcement.create({ title: 'Welcome!', content: 'Welcome to the expo.', authorId: admin._id, exhibitionId: exhibition._id });

    console.log('Enterprise Data Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
