const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'cancelled'], default: 'pending' },
  scheduledAt: { type: Date, required: true },
  durationMinutes: { type: Number, default: 30 },
  location: { type: String },
  agenda: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
