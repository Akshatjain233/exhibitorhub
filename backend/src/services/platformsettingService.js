const platformsettingRepository = require('../repositories/platformsettingRepository');
class PlatformSettingService {
  async getAll(query) { return await platformsettingRepository.findAll(query); }
  async getById(id) { return await platformsettingRepository.findById(id); }
  async create(data) { return await platformsettingRepository.create(data); }
  async update(id, data) { return await platformsettingRepository.update(id, data); }
  async delete(id) { return await platformsettingRepository.delete(id); }
}
module.exports = new PlatformSettingService();