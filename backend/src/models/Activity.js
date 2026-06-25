const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  exhibitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor' },
  title: { type: String, required: true },
  time: { type: String, required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

activitySchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Activity', activitySchema);
