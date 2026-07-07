const mongoose = require('mongoose');

const floorMapSchema = new mongoose.Schema({
  hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true, unique: true },
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  image_url: { type: String, required: true },
  width: { type: Number }, // Original image width in px
  height: { type: Number }, // Original image height in px
  scale: { type: Number, default: 1 }, // Map scale for booth coordinates
  version: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('FloorMap', floorMapSchema);
