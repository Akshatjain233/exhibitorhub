const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  exhibitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor' },
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  category: { type: String }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Product', productSchema);
