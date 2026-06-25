const mongoose = require('mongoose');

const organizerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactEmail: { type: String, required: true },
  phone: { type: String },
  website: { type: String },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

organizerSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Organizer', organizerSchema);
