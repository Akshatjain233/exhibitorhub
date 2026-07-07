const Notification = require('../models/Notification');

class NotificationRepository {
  async create(data) {
    return await Notification.create(data);
  }

  async insertMany(dataArray) {
    return await Notification.insertMany(dataArray);
  }

  async findAll(query = {}, skip = 0, limit = 20, sort = { createdAt: -1 }) {
    return await Notification.find(query)
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await Notification.countDocuments(query);
  }

  async update(id, updateData) {
    return await Notification.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany({ recipient: userId, read: false }, { read: true });
  }

  async delete(id) {
    return await Notification.findByIdAndDelete(id);
  }
}

module.exports = new NotificationRepository();
