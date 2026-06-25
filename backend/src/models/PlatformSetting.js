const mongoose = require('mongoose');

const platformSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

platformSettingSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('PlatformSetting', platformSettingSchema);
