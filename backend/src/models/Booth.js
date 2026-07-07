const mongoose = require('mongoose');

const boothSchema = new mongoose.Schema({
  hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  booth_number: { type: String, required: true },
  size: { type: String }, // e.g., "3x3", "6x3"
  type: { type: String, enum: ['standard', 'premium', 'island', 'custom'], default: 'standard' },
  status: { type: String, enum: ['available', 'reserved', 'booked'], default: 'available' },
  price: { type: Number },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor' }, // Which exhibitor has this booth
  coordinates: {
    x: Number,
    y: Number,
    width: Number,
    height: Number
  } // For rendering on an interactive floor map
}, { timestamps: true });

// A booth number must be unique within an exhibition
boothSchema.index({ exhibition: 1, booth_number: 1 }, { unique: true });

module.exports = mongoose.model('Booth', boothSchema);
