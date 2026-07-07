const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exhibitorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor' },
  scannedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  qrData: { type: String },
  qualification: { type: String, enum: ['hot', 'warm', 'cold', 'unqualified'], default: 'unqualified' },
  notes: { type: String },
  tags: [{ type: String }],
  followUp: { type: Boolean, default: false }
}, { timestamps: true });

leadSchema.index({ exhibition: 1, scannedBy: 1, scannedUser: 1 }, { unique: true });

module.exports = mongoose.model('Lead', leadSchema);
