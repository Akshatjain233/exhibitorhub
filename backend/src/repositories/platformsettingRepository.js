const PlatformSetting = require('../models/PlatformSetting');
class PlatformSettingRepository {
  async findAll(query = {}) { return await PlatformSetting.find(query); }
  async findById(id) { return await PlatformSetting.findById(id); }
  async create(data) { return await PlatformSetting.create(data); }
  async update(id, data) { return await PlatformSetting.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await PlatformSetting.findByIdAndDelete(id); }
}
module.exports = new PlatformSettingRepository();