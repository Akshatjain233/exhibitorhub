const qrPassRepository = require('../repositories/qrPassRepository');
const crypto = require('crypto');

class QRPassService {
  async generateQRPass(data) {
    const existing = await qrPassRepository.findOne({ user: data.user, exhibition: data.exhibition });
    if (existing) {
      const error = new Error('A QR pass already exists for this user in this exhibition');
      error.statusCode = 400;
      throw error;
    }

    // Generate unique QR payload
    data.qr_code_data = crypto.randomUUID();
    data.issued_at = new Date();

    return await qrPassRepository.create(data);
  }

  async regenerateQRPass(id) {
    const qrPass = await qrPassRepository.findById(id);
    if (!qrPass) {
      const error = new Error('QR Pass not found');
      error.statusCode = 404;
      throw error;
    }

    const new_qr_data = crypto.randomUUID();
    return await qrPassRepository.update(id, { qr_code_data: new_qr_data });
  }

  async validateQR(qr_code_data) {
    const qrPass = await qrPassRepository.findByQRData(qr_code_data);
    if (!qrPass) {
      const error = new Error('Invalid QR Code');
      error.statusCode = 404;
      throw error;
    }

    if (qrPass.status !== 'active') {
      const error = new Error(`QR Pass is ${qrPass.status}`);
      error.statusCode = 400;
      throw error;
    }

    return qrPass;
  }

  async getQRPasses(queryData) {
    const { page = 1, limit = 10, exhibition, user, status, pass_type, sort } = queryData;
    
    let query = {};
    if (exhibition) query.exhibition = exhibition;
    if (user) query.user = user;
    if (status) query.status = status;
    if (pass_type) query.pass_type = pass_type;

    let sortObj = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const passes = await qrPassRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await qrPassRepository.count(query);

    return {
      passes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async getQRPassById(id) {
    const qrPass = await qrPassRepository.findById(id);
    if (!qrPass) {
      const error = new Error('QR Pass not found');
      error.statusCode = 404;
      throw error;
    }
    return qrPass;
  }

  async updateStatus(id, status) {
    const qrPass = await qrPassRepository.update(id, { status });
    if (!qrPass) {
      const error = new Error('QR Pass not found');
      error.statusCode = 404;
      throw error;
    }
    return qrPass;
  }

  async checkIn(qr_code_data, scannerUserId, location = 'Main Entrance') {
    const qrPass = await this.validateQR(qr_code_data);
    
    const update = {
      $push: {
        check_ins: {
          timestamp: new Date(),
          location,
          scanned_by: scannerUserId
        }
      }
    };
    
    return await qrPassRepository.update(qrPass._id, update);
  }

  async checkOut(qr_code_data, scannerUserId, location = 'Main Exit') {
    const qrPass = await this.validateQR(qr_code_data);
    
    const update = {
      $push: {
        check_outs: {
          timestamp: new Date(),
          location,
          scanned_by: scannerUserId
        }
      }
    };
    
    return await qrPassRepository.update(qrPass._id, update);
  }

  async deleteQRPass(id) {
    const qrPass = await qrPassRepository.delete(id);
    if (!qrPass) {
      const error = new Error('QR Pass not found');
      error.statusCode = 404;
      throw error;
    }
    return qrPass;
  }
}

module.exports = new QRPassService();
