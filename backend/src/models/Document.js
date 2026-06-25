const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  exhibitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor', required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

documentSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Document', documentSchema);
