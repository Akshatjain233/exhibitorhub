const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tier: { type: String, enum: ['Platinum', 'Gold', 'Silver', 'Bronze'], default: 'Silver' },
  logoUrl: { type: String },
  website: { type: String },
  exhibitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

sponsorSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Sponsor', sponsorSchema);
