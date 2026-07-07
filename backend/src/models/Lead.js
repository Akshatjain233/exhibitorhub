const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  exhibitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor', required: true },
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  scanned_at: { type: Date, default: Date.now },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'converted', 'lost'], default: 'new' },
  notes: { type: String },
  rating: { type: Number, min: 1, max: 5 }, // e.g., Hot/Warm/Cold lead represented as stars
  tags: [{ type: String }]
}, { timestamps: true });

// Prevent scanning the same visitor twice by the same exhibitor at the same exhibition
leadSchema.index({ exhibitor: 1, visitor: 1, exhibition: 1 }, { unique: true });

module.exports = mongoose.model('Lead', leadSchema);
