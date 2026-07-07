const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  capacity: { type: Number },
  map_url: { type: String }, // Google maps link
  images: [{ type: String }], // S3 URLs
  contact_info: {
    phone: String,
    email: String
  },
  exhibitions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition' }]
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
