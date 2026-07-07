const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: { type: String },
  designation: { type: String },
  industry: { type: String },
  interests: [{ type: String }],
  qrPass: { type: mongoose.Schema.Types.ObjectId, ref: 'QRPass' }, // Linked QR Pass
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  avatar: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
