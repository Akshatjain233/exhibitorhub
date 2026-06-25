const Organizer = require('../models/Organizer');
class OrganizerRepository {
  async findAll(query = {}) { return await Organizer.find(query); }
  async findById(id) { return await Organizer.findById(id); }
  async create(data) { return await Organizer.create(data); }
  async update(id, data) { return await Organizer.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await Organizer.findByIdAndDelete(id); }
}
module.exports = new OrganizerRepository();