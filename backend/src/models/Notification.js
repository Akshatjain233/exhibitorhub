const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'alert', 'meeting', 'reminder'], default: 'info' },
  read: { type: Boolean, default: false },
  link: { type: String } // Optional link to redirect user to specific page
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
