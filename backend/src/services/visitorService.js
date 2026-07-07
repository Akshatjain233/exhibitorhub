const visitorRepository = require('../repositories/visitorRepository');

class VisitorService {
  async createVisitor(data) {
    const exists = await visitorRepository.findOne({ userId: data.userId });
    if (exists) {
      const error = new Error('Visitor profile already exists for this user');
      error.statusCode = 400;
      throw error;
    }
    return await visitorRepository.create(data);
  }

  async getVisitors(queryData) {
    const { page = 1, limit = 10, search, status, industry, sort } = queryData;
    
    let query = {};
    if (status) query.status = status;
    if (industry) query.industry = industry;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const visitors = await visitorRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await visitorRepository.count(query);

    return {
      visitors,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async getVisitorById(id) {
    const visitor = await visitorRepository.findById(id);
    if (!visitor) {
      const error = new Error('Visitor not found');
      error.statusCode = 404;
      throw error;
    }
    return visitor;
  }

  async updateVisitor(id, data, currentUserId, currentUserRole) {
    const visitor = await visitorRepository.findById(id);
    if (!visitor) {
      const error = new Error('Visitor not found');
      error.statusCode = 404;
      throw error;
    }

    // Role check: Visitor can only update their own profile
    if (currentUserRole === 'visitor' && visitor.userId._id.toString() !== currentUserId) {
      const error = new Error('You can only update your own visitor profile');
      error.statusCode = 403;
      throw error;
    }

    return await visitorRepository.update(id, data);
  }

  async deleteVisitor(id) {
    const visitor = await visitorRepository.delete(id);
    if (!visitor) {
      const error = new Error('Visitor not found');
      error.statusCode = 404;
      throw error;
    }
    return visitor;
  }
}

module.exports = new VisitorService();
