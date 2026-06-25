const mongoose = require('mongoose');

const exhibitorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  industry: { type: String },
  country: { type: String },
  hall: { type: String },
  booth: { type: String },
  description: { type: String },
  tagline: { type: String },
  logo: { type: String },
  verified: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  tags: [{ type: String }],
  categories: [{ type: String }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Map _id to id to match frontend perfectly
exhibitorSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Exhibitor', exhibitorSchema);
