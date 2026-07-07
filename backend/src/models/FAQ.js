const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition' }, // If null, it's a global platform FAQ
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'General' }, // e.g., 'Ticketing', 'Travel', 'General'
  order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('FAQ', faqSchema);
