const mongoose = require('mongoose');

const qrPassSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  pass_type: { type: String, enum: ['visitor', 'exhibitor', 'vip', 'speaker', 'press', 'staff'], default: 'visitor' },
  qr_code_data: { type: String, required: true, unique: true }, // Hash or payload for QR validation
  qr_image_url: { type: String },
  status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active' },
  issued_at: { type: Date, default: Date.now },
  expires_at: { type: Date },
  check_ins: [{
    timestamp: { type: Date, default: Date.now },
    location: { type: String }, // e.g., "Main Entrance", "Hall A"
    scanned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true });

// One pass per user per exhibition
qrPassSchema.index({ user: 1, exhibition: 1 }, { unique: true });

module.exports = mongoose.model('QRPass', qrPassSchema);
