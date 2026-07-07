const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user who requested the meeting
  invitee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user who is invited
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'cancelled', 'completed'], default: 'pending' },
  location: { type: String }, // e.g., "Booth 12A", "Networking Lounge"
  booth: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth' }, // If meeting is at a specific booth
  agenda: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
