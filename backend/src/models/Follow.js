const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The Visitor/User
  exhibitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor', required: true }, // The Exhibitor Profile being followed
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true } // Context
}, { timestamps: true });

// Prevent duplicate follows
followSchema.index({ follower: 1, exhibitor: 1 }, { unique: true });
followSchema.index({ exhibitor: 1 });

module.exports = mongoose.model('Follow', followSchema);
