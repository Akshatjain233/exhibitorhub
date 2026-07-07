const exhibitorRepository = require('../repositories/exhibitorRepository');
const exhibitionRepository = require('../repositories/exhibitionRepository');
const boothRepository = require('../repositories/boothRepository');

class ExhibitorService {
  async createExhibitor(data) {
    const exhibition = await exhibitionRepository.findById(data.exhibition);
    if (!exhibition) {
      const error = new Error('Exhibition not found');
      error.statusCode = 404;
      throw error;
    }

    const exists = await exhibitorRepository.findOne({ userId: data.userId, exhibition: data.exhibition });
    if (exists) {
      const error = new Error('This user is already an exhibitor for this exhibition');
      error.statusCode = 400;
      throw error;
    }

    // If booth is provided, verify it exists and is available
    if (data.booth) {
      const booth = await boothRepository.findById(data.booth);
      if (!booth || booth.exhibition._id.toString() !== data.exhibition) {
        const error = new Error('Booth not found in this exhibition');
        error.statusCode = 404;
        throw error;
      }
      if (booth.status === 'booked' || booth.assigned_to) {
        const error = new Error('This booth is already assigned');
        error.statusCode = 400;
        throw error;
      }
    }

    const exhibitor = await exhibitorRepository.create(data);

    if (data.booth) {
      await boothRepository.update(data.booth, { status: 'booked', assigned_to: exhibitor._id });
    }

    return exhibitor;
  }

  async getExhibitors(queryData) {
    const { page = 1, limit = 10, exhibition, status, featured, verified, search, sort } = queryData;
    
    let query = {};
    if (exhibition) query.exhibition = exhibition;
    if (status) query.status = status;
    if (featured !== undefined) query.featured = featured === 'true';
    if (verified !== undefined) query.verified = verified === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    let sortObj = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const exhibitors = await exhibitorRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await exhibitorRepository.count(query);

    return {
      exhibitors,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async getExhibitorById(id) {
    const exhibitor = await exhibitorRepository.findById(id);
    if (!exhibitor) {
      const error = new Error('Exhibitor not found');
      error.statusCode = 404;
      throw error;
    }
    return exhibitor;
  }

  async updateExhibitor(id, data, currentUserId, currentUserRole) {
    const exhibitor = await exhibitorRepository.findById(id);
    if (!exhibitor) {
      const error = new Error('Exhibitor not found');
      error.statusCode = 404;
      throw error;
    }

    // Role check: Exhibitor can only update their own profile
    if (currentUserRole === 'exhibitor' && exhibitor.userId._id.toString() !== currentUserId) {
      const error = new Error('You can only update your own exhibitor profile');
      error.statusCode = 403;
      throw error;
    }

    // Exhibitors cannot update their own status, verified, or featured flags
    if (currentUserRole === 'exhibitor') {
      delete data.status;
      delete data.verified;
      delete data.featured;
    }

    return await exhibitorRepository.update(id, data);
  }

  async updateStatus(id, status) {
    const exhibitor = await exhibitorRepository.update(id, { status });
    if (!exhibitor) {
      const error = new Error('Exhibitor not found');
      error.statusCode = 404;
      throw error;
    }
    return exhibitor;
  }

  async assignBooth(id, boothId) {
    const exhibitor = await exhibitorRepository.findById(id);
    if (!exhibitor) {
      const error = new Error('Exhibitor not found');
      error.statusCode = 404;
      throw error;
    }

    const booth = await boothRepository.findById(boothId);
    if (!booth) {
      const error = new Error('Booth not found');
      error.statusCode = 404;
      throw error;
    }

    if (booth.exhibition._id.toString() !== exhibitor.exhibition._id.toString()) {
      const error = new Error('Booth does not belong to the same exhibition as the exhibitor');
      error.statusCode = 400;
      throw error;
    }

    if (booth.assigned_to && booth.assigned_to._id.toString() !== id) {
      const error = new Error('Booth is already assigned to another exhibitor');
      error.statusCode = 400;
      throw error;
    }

    // Free up old booth if they had one
    if (exhibitor.booth && exhibitor.booth._id.toString() !== boothId) {
      await boothRepository.update(exhibitor.booth._id, { status: 'available', assigned_to: null });
    }

    // Assign new booth
    await boothRepository.update(boothId, { status: 'booked', assigned_to: exhibitor._id });
    return await exhibitorRepository.update(id, { booth: boothId });
  }

  async deleteExhibitor(id) {
    const exhibitor = await exhibitorRepository.findById(id);
    if (!exhibitor) {
      const error = new Error('Exhibitor not found');
      error.statusCode = 404;
      throw error;
    }

    // Unassign booth
    if (exhibitor.booth) {
      await boothRepository.update(exhibitor.booth._id, { status: 'available', assigned_to: null });
    }

    return await exhibitorRepository.delete(id);
  }
}

module.exports = new ExhibitorService();