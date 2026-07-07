const mongoose = require('mongoose');

const exhibitorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  booth: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth' },
  name: { type: String, required: true },
  industry: { type: String },
  country: { type: String },
  description: { type: String },
  tagline: { type: String },
  logo: { type: String },
  verified: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'active', 'inactive'], default: 'pending' },
  tags: [{ type: String }],
  categories: [{ type: String }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

exhibitorSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Exhibitor', exhibitorSchema);
