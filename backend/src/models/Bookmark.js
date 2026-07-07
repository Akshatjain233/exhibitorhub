const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  itemType: { type: String, enum: ['exhibitor', 'product', 'session'], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  notes: { type: String }
}, { timestamps: true });

bookmarkSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
