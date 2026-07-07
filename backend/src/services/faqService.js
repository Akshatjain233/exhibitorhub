const faqRepository = require('../repositories/faqRepository');

class FAQService {
  async createFAQ(data) {
    if (!data.order) {
      const count = await faqRepository.count({ exhibition: data.exhibition, category: data.category });
      data.order = count + 1;
    }
    return await faqRepository.create(data);
  }

  async getFAQs(queryData) {
    const { exhibition, category, search, isActive } = queryData;
    
    let query = {};
    if (exhibition) query.exhibition = exhibition;
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } }
      ];
    }

    const sortObj = { category: 1, order: 1 };
    
    // For FAQs, usually no pagination is better unless it's a huge list. We'll return all matched up to 100.
    const faqs = await faqRepository.findAll(query, 0, 100, sortObj);

    return faqs;
  }

  async getFAQById(id) {
    const faq = await faqRepository.findById(id);
    if (!faq) {
      const error = new Error('FAQ not found');
      error.statusCode = 404;
      throw error;
    }
    return faq;
  }

  async updateFAQ(id, data) {
    const faq = await faqRepository.update(id, data);
    if (!faq) {
      const error = new Error('FAQ not found');
      error.statusCode = 404;
      throw error;
    }
    return faq;
  }

  async deleteFAQ(id) {
    const faq = await faqRepository.delete(id);
    if (!faq) {
      const error = new Error('FAQ not found');
      error.statusCode = 404;
      throw error;
    }
    return faq;
  }

  async reorderFAQs(faqsData) {
    // Expected format: [{ id: "...", order: 1 }, { id: "...", order: 2 }]
    await faqRepository.bulkUpdateOrder(faqsData);
    return { success: true, message: 'FAQs reordered' };
  }
}

module.exports = new FAQService();
