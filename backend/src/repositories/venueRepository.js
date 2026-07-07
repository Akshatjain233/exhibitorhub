const Venue = require('../models/Venue');

class VenueRepository {
  async create(venueData) {
    return await Venue.create(venueData);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    return await Venue.find(query).sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await Venue.countDocuments(query);
  }

  async findById(id) {
    return await Venue.findById(id).exec();
  }

  async update(id, updateData) {
    return await Venue.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Venue.findByIdAndDelete(id);
  }
}

module.exports = new VenueRepository();
