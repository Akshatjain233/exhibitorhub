const faqService = require('../services/faqService');
const { successResponse } = require('../utils/response');

exports.createFAQ = async (req, res, next) => {
  try {
    const faq = await faqService.createFAQ(req.body);
    return successResponse(res, 201, 'FAQ created successfully', faq);
  } catch (error) {
    next(error);
  }
};

exports.getFAQs = async (req, res, next) => {
  try {
    const data = await faqService.getFAQs(req.query);
    return successResponse(res, 200, 'FAQs retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getFAQById = async (req, res, next) => {
  try {
    const faq = await faqService.getFAQById(req.params.id);
    return successResponse(res, 200, 'FAQ retrieved successfully', faq);
  } catch (error) {
    next(error);
  }
};

exports.updateFAQ = async (req, res, next) => {
  try {
    const faq = await faqService.updateFAQ(req.params.id, req.body);
    return successResponse(res, 200, 'FAQ updated successfully', faq);
  } catch (error) {
    next(error);
  }
};

exports.deleteFAQ = async (req, res, next) => {
  try {
    await faqService.deleteFAQ(req.params.id);
    return successResponse(res, 200, 'FAQ deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.reorderFAQs = async (req, res, next) => {
  try {
    await faqService.reorderFAQs(req.body.faqs);
    return successResponse(res, 200, 'FAQs reordered successfully');
  } catch (error) {
    next(error);
  }
};
