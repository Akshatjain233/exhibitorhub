const registrationRepository = require('../repositories/registrationRepository');
const exhibitionRepository = require('../repositories/exhibitionRepository');

class RegistrationService {
  async register(data) {
    const exhibition = await exhibitionRepository.findById(data.exhibition);
    if (!exhibition) {
      const error = new Error('Exhibition not found');
      error.statusCode = 404;
      throw error;
    }

    if (!exhibition.settings?.allow_registration) {
      const error = new Error('Registration is closed for this exhibition');
      error.statusCode = 400;
      throw error;
    }

    const existing = await registrationRepository.findOne({ exhibition: data.exhibition, user: data.user });
    if (existing) {
      const error = new Error('User is already registered for this exhibition');
      error.statusCode = 400;
      throw error;
    }

    return await registrationRepository.create(data);
  }

  async getRegistrations(queryData) {
    const { page = 1, limit = 10, exhibition, user, status, role, sort } = queryData;
    
    let query = {};
    if (exhibition) query.exhibition = exhibition;
    if (user) query.user = user;
    if (status) query.status = status;
    if (role) query.role = role;

    let sortObj = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const registrations = await registrationRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await registrationRepository.count(query);

    return {
      registrations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async getRegistrationById(id) {
    const reg = await registrationRepository.findById(id);
    if (!reg) {
      const error = new Error('Registration not found');
      error.statusCode = 404;
      throw error;
    }
    return reg;
  }

  async updateStatus(id, status) {
    const reg = await registrationRepository.update(id, { status });
    if (!reg) {
      const error = new Error('Registration not found');
      error.statusCode = 404;
      throw error;
    }
    return reg;
  }

  async checkIn(id) {
    const reg = await registrationRepository.findById(id);
    if (!reg) {
      const error = new Error('Registration not found');
      error.statusCode = 404;
      throw error;
    }
    if (reg.status !== 'approved') {
      const error = new Error('Registration is not approved');
      error.statusCode = 400;
      throw error;
    }
    if (reg.checkInStatus) {
      const error = new Error('User has already checked in');
      error.statusCode = 400;
      throw error;
    }

    return await registrationRepository.update(id, { checkInStatus: true, checkInTime: new Date() });
  }

  async deleteRegistration(id) {
    const reg = await registrationRepository.delete(id);
    if (!reg) {
      const error = new Error('Registration not found');
      error.statusCode = 404;
      throw error;
    }
    return reg;
  }
}

module.exports = new RegistrationService();
