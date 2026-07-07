const leadRepository = require('../repositories/leadRepository');
const qrPassService = require('../services/qrPassService');
const exhibitorRepository = require('../repositories/exhibitorRepository');

class LeadService {
  async scanLead(data, scannerUserId) {
    // 1. Validate the QR pass
    const qrPass = await qrPassService.validateQR(data.qrData);
    
    if (qrPass.exhibition._id.toString() !== data.exhibition) {
      const error = new Error('This pass does not belong to the current exhibition');
      error.statusCode = 400;
      throw error;
    }

    // 2. Find exhibitor profile for the scanner
    const exhibitor = await exhibitorRepository.findOne({ userId: scannerUserId, exhibition: data.exhibition });

    const leadData = {
      exhibition: data.exhibition,
      scannedBy: scannerUserId,
      exhibitorProfile: exhibitor ? exhibitor._id : null,
      scannedUser: qrPass.user._id,
      qrData: data.qrData
    };

    try {
      return await leadRepository.create(leadData);
    } catch (err) {
      if (err.code === 11000) {
        const error = new Error('Lead already scanned by this user');
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }
  }

  async getLeads(queryData, currentUserId, currentUserRole) {
    const { page = 1, limit = 10, exhibition, qualification, followUp, sort } = queryData;
    
    let query = {};
    if (exhibition) query.exhibition = exhibition;
    if (qualification) query.qualification = qualification;
    if (followUp !== undefined) query.followUp = followUp === 'true';

    // Exhibitors can only see their own leads or leads of their company
    if (currentUserRole === 'exhibitor') {
      const exhibitor = await exhibitorRepository.findOne({ userId: currentUserId, exhibition });
      if (exhibitor) {
         query.exhibitorProfile = exhibitor._id;
      } else {
         query.scannedBy = currentUserId;
      }
    }

    let sortObj = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj = { [field]: order === 'asc' ? 1 : -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const leads = await leadRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await leadRepository.count(query);

    return {
      leads,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async getLeadById(id, currentUserId, currentUserRole) {
    const lead = await leadRepository.findById(id);
    if (!lead) {
      const error = new Error('Lead not found');
      error.statusCode = 404;
      throw error;
    }

    if (currentUserRole === 'exhibitor') {
      const exhibitor = await exhibitorRepository.findOne({ userId: currentUserId, exhibition: lead.exhibition });
      if (lead.scannedBy.toString() !== currentUserId && (!exhibitor || lead.exhibitorProfile?.toString() !== exhibitor._id.toString())) {
        const error = new Error('Unauthorized to view this lead');
        error.statusCode = 403;
        throw error;
      }
    }

    return lead;
  }

  async updateLead(id, data, currentUserId, currentUserRole) {
    const lead = await this.getLeadById(id, currentUserId, currentUserRole); // Reuse access check
    return await leadRepository.update(id, data);
  }

  async deleteLead(id, currentUserId, currentUserRole) {
    const lead = await this.getLeadById(id, currentUserId, currentUserRole); // Reuse access check
    return await leadRepository.delete(id);
  }

  async exportLeads(queryData, currentUserId, currentUserRole) {
    // In a real implementation, this would generate a CSV and return a buffer or S3 URL.
    // For now, we return the raw JSON data that the controller will convert.
    const data = await this.getLeads({ ...queryData, limit: 10000 }, currentUserId, currentUserRole);
    return data.leads;
  }

  async getDashboardStats(exhibitionId, currentUserId, currentUserRole) {
    let matchQuery = { exhibition: exhibitionId };
    
    if (currentUserRole === 'exhibitor') {
      const exhibitor = await exhibitorRepository.findOne({ userId: currentUserId, exhibition: exhibitionId });
      if (exhibitor) {
         matchQuery.exhibitorProfile = exhibitor._id;
      } else {
         matchQuery.scannedBy = currentUserId;
      }
    }

    // NOTE: This uses mongoose ObjectId casting manually if needed, but we rely on mongoose aggregation pipeline.
    const pipeline = [
      { $match: matchQuery },
      { 
        $group: { 
          _id: '$qualification', 
          count: { $sum: 1 } 
        } 
      }
    ];

    const stats = await leadRepository.aggregate(pipeline);
    
    const total = await leadRepository.count(matchQuery);
    const followUps = await leadRepository.count({ ...matchQuery, followUp: true });

    return {
      total,
      followUps,
      qualificationStats: stats
    };
  }
}

module.exports = new LeadService();
