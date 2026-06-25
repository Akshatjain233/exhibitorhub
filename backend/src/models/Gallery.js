const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  caption: { type: String },
  exhibitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor', required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

gallerySchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Gallery', gallerySchema);
