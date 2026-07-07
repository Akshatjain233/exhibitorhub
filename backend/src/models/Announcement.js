const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  targetAudience: { type: String, enum: ['all', 'exhibitor', 'visitor'], default: 'all' },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
