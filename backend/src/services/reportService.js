const registrationRepository = require('../repositories/registrationRepository');
const leadRepository = require('../repositories/leadRepository');

class ReportService {
  async generateRegistrationReport(exhibitionId, format = 'json') {
    // 1. Fetch data
    const registrations = await registrationRepository.findAll({ exhibition: exhibitionId }, 0, 10000);
    
    // 2. Format based on requested output (stubbing PDF/Excel)
    if (format === 'csv') {
      return this._convertToCSV(registrations, ['user.name', 'user.email', 'ticketType', 'status', 'createdAt']);
    }

    if (format === 'pdf') {
      // Stub PDF generation
      return { type: 'pdf', message: 'PDF report generated (Stub)', url: 'https://s3.aws.com/reports/registration_123.pdf' };
    }

    // Default JSON
    return registrations;
  }

  async generateLeadsReport(exhibitionId, exhibitorProfileId, format = 'json') {
    let query = { exhibition: exhibitionId };
    if (exhibitorProfileId) {
      query.exhibitorProfile = exhibitorProfileId;
    }

    const leads = await leadRepository.findAll(query, 0, 10000);

    if (format === 'csv') {
      return this._convertToCSV(leads, ['scannedUser.name', 'scannedUser.email', 'qualification', 'followUp', 'createdAt']);
    }

    if (format === 'pdf') {
      return { type: 'pdf', message: 'PDF report generated (Stub)', url: 'https://s3.aws.com/reports/leads_123.pdf' };
    }

    return leads;
  }

  _convertToCSV(data, fields) {
    if (!data || data.length === 0) return '';
    
    // Simple naive CSV converter for stub purposes
    const header = fields.join(',');
    const rows = data.map(item => {
      return fields.map(field => {
        const parts = field.split('.');
        let val = item;
        for (const p of parts) {
          if (val) val = val[p];
        }
        return val ? `"${val}"` : '';
      }).join(',');
    });

    return [header, ...rows].join('\n');
  }
}

module.exports = new ReportService();
