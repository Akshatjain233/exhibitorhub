const sponsorRepository = require('../repositories/sponsorRepository');
const exhibitionRepository = require('../repositories/exhibitionRepository');

class SponsorService {
  async createSponsor(data) {
    const exhibition = await exhibitionRepository.findById(data.exhibition);
    if (!exhibition) {
      const error = new Error('Exhibition not found');
      error.statusCode = 404;
      throw error;
    }
    return await sponsorRepository.create(data);
  }

  async getSponsors(queryData) {
    const { page = 1, limit = 10, exhibition, category, isVisible, search, sort } = queryData;
    
    let query = {};
    if (exhibition) query.exhibition = exhibition;
    if (category) query.category = category;
    if (isVisible !== undefined) query.isVisible = isVisible === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    let sortObj = { priority: -1, createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj = { [field]: order === 'asc' ? 1 : -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sponsors = await sponsorRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await sponsorRepository.count(query);

    return {
      sponsors,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async getSponsorById(id) {
    const sponsor = await sponsorRepository.findById(id);
    if (!sponsor) {
      const error = new Error('Sponsor not found');
      error.statusCode = 404;
      throw error;
    }
    return sponsor;
  }

  async updateSponsor(id, data) {
    const sponsor = await sponsorRepository.update(id, data);
    if (!sponsor) {
      const error = new Error('Sponsor not found');
      error.statusCode = 404;
      throw error;
    }
    return sponsor;
  }

  async deleteSponsor(id) {
    const sponsor = await sponsorRepository.delete(id);
    if (!sponsor) {
      const error = new Error('Sponsor not found');
      error.statusCode = 404;
      throw error;
    }
    return sponsor;
  }
}

module.exports = new SponsorService();