const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Exhibition Admin or Super Admin
  exhibitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition' }, // null means global platform announcement
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

announcementSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Announcement', announcementSchema);
