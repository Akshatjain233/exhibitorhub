const floorMapRepository = require('../repositories/floorMapRepository');
const hallRepository = require('../repositories/hallRepository');
const boothRepository = require('../repositories/boothRepository');

class FloorMapService {
  async createFloorMap(data) {
    const hall = await hallRepository.findById(data.hall);
    if (!hall) {
      const error = new Error('Hall not found');
      error.statusCode = 404;
      throw error;
    }

    const exists = await floorMapRepository.findOne({ hall: data.hall });
    if (exists) {
      const error = new Error('A floor map already exists for this hall. Please update it instead.');
      error.statusCode = 400;
      throw error;
    }

    return await floorMapRepository.create(data);
  }

  async getFloorMaps(queryData) {
    const { page = 1, limit = 10, exhibition, hall, sort } = queryData;
    
    let query = {};
    if (exhibition) query.exhibition = exhibition;
    if (hall) query.hall = hall;

    let sortObj = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const maps = await floorMapRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await floorMapRepository.count(query);

    return {
      floorMaps: maps,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async getFloorMapById(id) {
    const map = await floorMapRepository.findById(id);
    if (!map) {
      const error = new Error('Floor map not found');
      error.statusCode = 404;
      throw error;
    }
    return map;
  }

  async getFloorMapByHall(hallId) {
    const map = await floorMapRepository.findOne({ hall: hallId });
    if (!map) {
      const error = new Error('Floor map not found for this hall');
      error.statusCode = 404;
      throw error;
    }
    return map;
  }

  async updateFloorMap(id, data) {
    const map = await floorMapRepository.update(id, data);
    if (!map) {
      const error = new Error('Floor map not found');
      error.statusCode = 404;
      throw error;
    }
    return map;
  }

  async deleteFloorMap(id) {
    const map = await floorMapRepository.delete(id);
    if (!map) {
      const error = new Error('Floor map not found');
      error.statusCode = 404;
      throw error;
    }
    return map;
  }

  async assignBoothCoordinates(hallId, boothId, coordinates) {
    const map = await floorMapRepository.findOne({ hall: hallId });
    if (!map) {
      const error = new Error('No floor map found for this hall. Please upload one first.');
      error.statusCode = 404;
      throw error;
    }

    const booth = await boothRepository.findById(boothId);
    if (!booth) {
      const error = new Error('Booth not found');
      error.statusCode = 404;
      throw error;
    }

    if (booth.hall._id.toString() !== hallId) {
      const error = new Error('Booth does not belong to this hall');
      error.statusCode = 400;
      throw error;
    }

    const updatedBooth = await boothRepository.update(boothId, { coordinates });
    return updatedBooth;
  }
}

module.exports = new FloorMapService();
