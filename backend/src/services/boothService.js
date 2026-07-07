const boothRepository = require('../repositories/boothRepository');
const hallRepository = require('../repositories/hallRepository');

class BoothService {
  async createBooth(data) {
    const hall = await hallRepository.findById(data.hall);
    if (!hall) {
      const error = new Error('Hall not found');
      error.statusCode = 404;
      throw error;
    }

    const exists = await boothRepository.findAll({ exhibition: data.exhibition, booth_number: data.booth_number });
    if (exists.length > 0) {
      const error = new Error('A booth with this number already exists in the selected exhibition');
      error.statusCode = 400;
      throw error;
    }

    return await boothRepository.create(data);
  }

  async getBooths(queryData) {
    const { page = 1, limit = 10, exhibition, hall, status, assigned_to, sort } = queryData;
    
    let query = {};
    if (exhibition) query.exhibition = exhibition;
    if (hall) query.hall = hall;
    if (status) query.status = status;
    if (assigned_to) query.assigned_to = assigned_to;

    let sortObj = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const booths = await boothRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await boothRepository.count(query);

    return {
      booths,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async getAvailableBooths(queryData) {
    return this.getBooths({ ...queryData, status: 'available' });
  }

  async getOccupiedBooths(queryData) {
    return this.getBooths({ ...queryData, status: { $in: ['reserved', 'booked'] } });
  }

  async getBoothById(id) {
    const booth = await boothRepository.findById(id);
    if (!booth) {
      const error = new Error('Booth not found');
      error.statusCode = 404;
      throw error;
    }
    return booth;
  }

  async updateBooth(id, data) {
    if (data.booth_number && data.exhibition) {
      const exists = await boothRepository.findAll({ exhibition: data.exhibition, booth_number: data.booth_number });
      if (exists.length > 0 && exists[0]._id.toString() !== id) {
        const error = new Error('A booth with this number already exists in the selected exhibition');
        error.statusCode = 400;
        throw error;
      }
    }

    const booth = await boothRepository.update(id, data);
    if (!booth) {
      const error = new Error('Booth not found');
      error.statusCode = 404;
      throw error;
    }
    return booth;
  }

  async deleteBooth(id) {
    const booth = await boothRepository.findById(id);
    if (!booth) {
      const error = new Error('Booth not found');
      error.statusCode = 404;
      throw error;
    }

    if (booth.assigned_to) {
      const error = new Error('Cannot delete a booth that is assigned to an exhibitor');
      error.statusCode = 400;
      throw error;
    }

    return await boothRepository.delete(id);
  }
}

module.exports = new BoothService();
