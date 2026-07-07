const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall' },
  title: { type: String, required: true },
  type: { type: String },
  time: { type: String },
  duration: { type: String },
  color: { type: String },
  seats: { type: Number },
  live: { type: Boolean, default: false },
  status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

sessionSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Session', sessionSchema);
