const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['platinum', 'gold', 'silver', 'bronze', 'partner', 'media'], default: 'partner' },
  logoUrl: { type: String },
  websiteUrl: { type: String },
  description: { type: String },
  priority: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Sponsor', sponsorSchema);
