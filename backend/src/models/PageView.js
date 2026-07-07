const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Null if anonymous/not logged in
  targetType: { type: String, enum: ['exhibitor', 'product', 'session', 'general'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId }, // ID of the exhibitor, product, etc.
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PageView', pageViewSchema);
