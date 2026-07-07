const reportService = require('../services/reportService');
const exhibitorRepository = require('../repositories/exhibitorRepository');
const { successResponse } = require('../utils/response');

exports.getRegistrationReport = async (req, res, next) => {
  try {
    const { exhibition, format } = req.query;
    if (!exhibition) return res.status(400).json({ success: false, message: 'Exhibition ID is required' });

    const report = await reportService.generateRegistrationReport(exhibition, format);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=registrations.csv');
      return res.status(200).send(report);
    }

    return successResponse(res, 200, 'Report generated', report);
  } catch (error) {
    next(error);
  }
};

exports.getLeadsReport = async (req, res, next) => {
  try {
    const { exhibition, format } = req.query;
    if (!exhibition) return res.status(400).json({ success: false, message: 'Exhibition ID is required' });

    let exhibitorProfileId = null;
    
    if (req.user.role === 'exhibitor') {
      const exhibitor = await exhibitorRepository.findOne({ userId: req.user.id, exhibition });
      if (!exhibitor) {
        return res.status(403).json({ success: false, message: 'Exhibitor profile not found' });
      }
      exhibitorProfileId = exhibitor._id;
    }

    const report = await reportService.generateLeadsReport(exhibition, exhibitorProfileId, format);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
      return res.status(200).send(report);
    }

    return successResponse(res, 200, 'Report generated', report);
  } catch (error) {
    next(error);
  }
};
