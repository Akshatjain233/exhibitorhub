const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemType: { type: String, enum: ['exhibitor', 'product', 'session', 'speaker'], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Generic reference ID
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true }
}, { timestamps: true });

// Prevent duplicate bookmarks for the same item by the same user
bookmarkSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
