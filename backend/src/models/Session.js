const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  time: { type: String },
  title: { type: String, required: true },
  type: { type: String },
  color: { type: String },
  speaker: { type: String },
  hall: { type: String },
  duration: { type: String },
  seats: { type: String },
  live: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

sessionSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Session', sessionSchema);
