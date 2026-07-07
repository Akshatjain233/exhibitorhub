const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  name: { type: String, required: true },
  floor: { type: String },
  capacity: { type: Number },
  dimensions: {
    length: Number,
    width: Number,
    unit: { type: String, enum: ['meters', 'feet'], default: 'meters' }
  },
  map_image_url: { type: String } // Uploaded S3 map
}, { timestamps: true });

module.exports = mongoose.model('Hall', hallSchema);
