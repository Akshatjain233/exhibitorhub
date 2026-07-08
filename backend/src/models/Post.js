const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorRole: { type: String, enum: ['super_admin', 'exhibition_admin', 'exhibitor'], required: true },
  exhibitorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor' }, // If author is exhibitor
  exhibition: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibition', required: true },
  content: { type: String, required: true },
  images: [{ type: String }],
  videos: [{ type: String }],
  attachments: [{ type: String }],
  type: { 
    type: String, 
    enum: ['Announcement', 'Product', 'Offer', 'Live Demo', 'Session Update', 'Sponsor', 'General'],
    default: 'General'
  },
  visibility: { type: String, enum: ['public', 'registered_only'], default: 'public' },
  status: { type: String, enum: ['active', 'hidden', 'draft'], default: 'active' },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 }
}, { timestamps: true });

// Add index for fast feed retrieval
postSchema.index({ exhibition: 1, createdAt: -1 });
postSchema.index({ author: 1 });

module.exports = mongoose.model('Post', postSchema);
