const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['visitor', 'exhibitor_staff'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  checkInStatus: { type: Boolean, default: false },
  checkInTime: { type: Date },
  qrPass: { type: mongoose.Schema.Types.ObjectId, ref: 'QRPass' }
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);
