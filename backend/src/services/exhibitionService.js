const exhibitionRepository = require('../repositories/exhibitionRepository');
const venueRepository = require('../repositories/venueRepository');

class ExhibitionService {
  async createExhibition(data) {
    const venue = await venueRepository.findById(data.venue);
    if (!venue) {
      const error = new Error('Venue not found');
      error.statusCode = 404;
      throw error;
    }
    return await exhibitionRepository.create(data);
  }

  async getExhibitions(queryData) {
    const { page = 1, limit = 10, status, search, sort } = queryData;
    
    let query = {};
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    let sortObj = { startDate: 1 }; // Default sort by upcoming
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const exhibitions = await exhibitionRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await exhibitionRepository.count(query);

    return {
      exhibitions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async getExhibitionById(id) {
    const exhibition = await exhibitionRepository.findById(id);
    if (!exhibition) {
      const error = new Error('Exhibition not found');
      error.statusCode = 404;
      throw error;
    }
    return exhibition;
  }

  async updateExhibition(id, data) {
    if (data.venue) {
      const venue = await venueRepository.findById(data.venue);
      if (!venue) {
        const error = new Error('Venue not found');
        error.statusCode = 404;
        throw error;
      }
    }

    const exhibition = await exhibitionRepository.update(id, data);
    if (!exhibition) {
      const error = new Error('Exhibition not found');
      error.statusCode = 404;
      throw error;
    }
    return exhibition;
  }

  async deleteExhibition(id) {
    const exhibition = await exhibitionRepository.delete(id);
    if (!exhibition) {
      const error = new Error('Exhibition not found');
      error.statusCode = 404;
      throw error;
    }
    return exhibition;
  }
}

module.exports = new ExhibitionService();