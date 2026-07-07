const sessionRepository = require('../repositories/sessionRepository');
const exhibitionRepository = require('../repositories/exhibitionRepository');
const hallRepository = require('../repositories/hallRepository');

class SessionService {
  async createSession(data) {
    const exhibition = await exhibitionRepository.findById(data.exhibition);
    if (!exhibition) {
      const error = new Error('Exhibition not found');
      error.statusCode = 404;
      throw error;
    }

    if (data.hall) {
      const hall = await hallRepository.findById(data.hall);
      if (!hall || hall.venue._id.toString() !== exhibition.venue._id.toString()) {
        const error = new Error('Hall does not belong to the exhibition venue');
        error.statusCode = 400;
        throw error;
      }
    }

    return await sessionRepository.create(data);
  }

  async getSessions(queryData) {
    const { page = 1, limit = 10, exhibition, hall, status, type, live, search, sort } = queryData;
    
    let query = {};
    if (exhibition) query.exhibition = exhibition;
    if (hall) query.hall = hall;
    if (status) query.status = status;
    if (type) query.type = type;
    if (live !== undefined) query.live = live === 'true';
    if (search) query.title = { $regex: search, $options: 'i' };

    let sortObj = { time: 1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sessions = await sessionRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await sessionRepository.count(query);

    return {
      sessions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async getSessionById(id) {
    const session = await sessionRepository.findById(id);
    if (!session) {
      const error = new Error('Session not found');
      error.statusCode = 404;
      throw error;
    }
    return session;
  }

  async updateSession(id, data) {
    if (data.hall) {
      const session = await sessionRepository.findById(id);
      if (!session) {
        const error = new Error('Session not found');
        error.statusCode = 404;
        throw error;
      }

      const hall = await hallRepository.findById(data.hall);
      if (!hall) {
        const error = new Error('Hall not found');
        error.statusCode = 404;
        throw error;
      }
    }

    return await sessionRepository.update(id, data);
  }

  async registerForSession(id, userId) {
    const session = await sessionRepository.findById(id);
    if (!session) {
      const error = new Error('Session not found');
      error.statusCode = 404;
      throw error;
    }

    if (session.status !== 'scheduled') {
      const error = new Error('Cannot register for a session that is not scheduled');
      error.statusCode = 400;
      throw error;
    }

    // Check capacity
    if (session.seats && session.registered_users.length >= session.seats) {
      const error = new Error('Session is fully booked');
      error.statusCode = 400;
      throw error;
    }

    const isRegistered = session.registered_users.some(user => user._id.toString() === userId.toString());
    if (isRegistered) {
      const error = new Error('Already registered for this session');
      error.statusCode = 400;
      throw error;
    }

    const update = { $push: { registered_users: userId } };
    return await sessionRepository.update(id, update);
  }

  async deleteSession(id) {
    const session = await sessionRepository.delete(id);
    if (!session) {
      const error = new Error('Session not found');
      error.statusCode = 404;
      throw error;
    }
    return session;
  }
}

module.exports = new SessionService();