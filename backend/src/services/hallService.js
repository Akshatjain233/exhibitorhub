const hallRepository = require('../repositories/hallRepository');
const venueRepository = require('../repositories/venueRepository');
const Booth = require('../models/Booth'); // Direct model import for dependency check

class HallService {
  async createHall(data) {
    // Check if venue exists
    const venue = await venueRepository.findById(data.venue);
    if (!venue) {
      const error = new Error('Venue not found');
      error.statusCode = 404;
      throw error;
    }

    // Check for duplicate hall names in the same venue
    const exists = await hallRepository.findAll({ venue: data.venue, name: data.name });
    if (exists.length > 0) {
      const error = new Error('A hall with this name already exists in the selected venue');
      error.statusCode = 400;
      throw error;
    }

    return await hallRepository.create(data);
  }

  async getHalls(queryData) {
    const { page = 1, limit = 10, search, venue, sort } = queryData;
    
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (venue) query.venue = venue; // Filter by venueId

    let sortObj = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const halls = await hallRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await hallRepository.count(query);

    return {
      halls,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async getHallById(id) {
    const hall = await hallRepository.findById(id);
    if (!hall) {
      const error = new Error('Hall not found');
      error.statusCode = 404;
      throw error;
    }
    return hall;
  }

  async updateHall(id, data) {
    if (data.venue) {
      const venue = await venueRepository.findById(data.venue);
      if (!venue) {
        const error = new Error('Venue not found');
        error.statusCode = 404;
        throw error;
      }
    }

    if (data.name) {
      // Find the hall to know its venue if not provided in data
      const currentHall = await hallRepository.findById(id);
      if (!currentHall) {
        const error = new Error('Hall not found');
        error.statusCode = 404;
        throw error;
      }
      const venueId = data.venue || currentHall.venue._id;
      const exists = await hallRepository.findAll({ venue: venueId, name: data.name });
      if (exists.length > 0 && exists[0]._id.toString() !== id) {
        const error = new Error('A hall with this name already exists in the selected venue');
        error.statusCode = 400;
        throw error;
      }
    }

    const hall = await hallRepository.update(id, data);
    if (!hall) {
      const error = new Error('Hall not found');
      error.statusCode = 404;
      throw error;
    }
    return hall;
  }

  async deleteHall(id) {
    // Prevent deletion if booths are assigned
    const boothCount = await Booth.countDocuments({ hall: id });
    if (boothCount > 0) {
      const error = new Error(`Cannot delete hall. There are ${boothCount} booths assigned to it.`);
      error.statusCode = 400;
      throw error;
    }

    const hall = await hallRepository.delete(id);
    if (!hall) {
      const error = new Error('Hall not found');
      error.statusCode = 404;
      throw error;
    }
    return hall;
  }
}

module.exports = new HallService();
