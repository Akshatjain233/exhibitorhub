const venueRepository = require('../repositories/venueRepository');

class VenueService {
  async createVenue(data) {
    // Check for duplicates
    const exists = await venueRepository.findAll({ name: data.name, city: data.city });
    if (exists.length > 0) {
      const error = new Error('A venue with this name in this city already exists');
      error.statusCode = 400;
      throw error;
    }
    return await venueRepository.create(data);
  }

  async getVenues(queryData) {
    const { page = 1, limit = 10, search, city, country, sort } = queryData;
    
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (city) query.city = city;
    if (country) query.country = country;

    let sortObj = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const venues = await venueRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await venueRepository.count(query);

    return {
      venues,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async getVenueById(id) {
    const venue = await venueRepository.findById(id);
    if (!venue) {
      const error = new Error('Venue not found');
      error.statusCode = 404;
      throw error;
    }
    return venue;
  }

  async updateVenue(id, data) {
    const venue = await venueRepository.update(id, data);
    if (!venue) {
      const error = new Error('Venue not found');
      error.statusCode = 404;
      throw error;
    }
    return venue;
  }

  async deleteVenue(id) {
    const venue = await venueRepository.delete(id);
    if (!venue) {
      const error = new Error('Venue not found');
      error.statusCode = 404;
      throw error;
    }
    return venue;
  }
}

module.exports = new VenueService();
