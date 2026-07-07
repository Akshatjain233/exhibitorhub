const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  exhibitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor', required: true },
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  gallery: [{ type: String }],
  brochure_url: { type: String },
  category: { type: String },
  featured: { type: Boolean, default: false },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Product', productSchema);
