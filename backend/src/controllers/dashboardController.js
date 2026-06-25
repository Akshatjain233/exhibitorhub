const Activity = require('../models/Activity');
const Product = require('../models/Product');

// Matches frontend kpis
// [ { label: 'Products', value: '24' }, ... ]
exports.getKpis = async (req, res, next) => {
  try {
    // In a real scenario we count actual documents, here we can mock some or do actual counts
    const productCount = await Product.countDocuments();
    
    const kpis = [
      { label: 'Products', value: productCount.toString() },
      { label: 'Gallery', value: '18' },
      { label: 'Documents', value: '6' },
      { label: 'Announcements', value: '4' },
    ];
    res.json(kpis);
  } catch (error) {
    next(error);
  }
};

// Matches frontend activities list
exports.getActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    next(error);
  }
};
