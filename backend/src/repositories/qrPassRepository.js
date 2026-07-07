const QRPass = require('../models/QRPass');

class QRPassRepository {
  async create(data) {
    return await QRPass.create(data);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    return await QRPass.find(query)
      .populate('user', 'name email role')
      .populate('exhibition', 'name startDate endDate')
      .populate('check_ins.scanned_by', 'name role')
      .populate('check_outs.scanned_by', 'name role')
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await QRPass.countDocuments(query);
  }

  async findById(id) {
    return await QRPass.findById(id)
      .populate('user', 'name email role')
      .populate('exhibition', 'name startDate endDate')
      .populate('check_ins.scanned_by', 'name role')
      .populate('check_outs.scanned_by', 'name role').exec();
  }

  async findByQRData(qr_code_data) {
    return await QRPass.findOne({ qr_code_data })
      .populate('user', 'name email role')
      .populate('exhibition', 'name startDate endDate').exec();
  }

  async findOne(query) {
    return await QRPass.findOne(query);
  }

  async update(id, updateData) {
    return await QRPass.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await QRPass.findByIdAndDelete(id);
  }
}

module.exports = new QRPassRepository();
