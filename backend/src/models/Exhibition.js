const mongoose = require('mongoose');

const exhibitionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  venue: { type: String, required: true },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizer' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

exhibitionSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Exhibition', exhibitionSchema);
