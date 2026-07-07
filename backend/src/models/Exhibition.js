const mongoose = require('mongoose');

const exhibitionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['draft', 'active', 'completed', 'cancelled'], default: 'draft' },
  floormap_url: { type: String },
  banner_url: { type: String },
  logo_url: { type: String },
  settings: {
    allow_registration: { type: Boolean, default: true },
    is_public: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

exhibitionSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Exhibition', exhibitionSchema);
