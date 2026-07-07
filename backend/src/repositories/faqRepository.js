const FAQ = require('../models/FAQ');

class FAQRepository {
  async create(data) {
    return await FAQ.create(data);
  }

  async findAll(query = {}, skip = 0, limit = 100, sort = { category: 1, order: 1 }) {
    return await FAQ.find(query)
      .populate('exhibition', 'name')
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await FAQ.countDocuments(query);
  }

  async findById(id) {
    return await FAQ.findById(id).populate('exhibition', 'name').exec();
  }

  async update(id, updateData) {
    return await FAQ.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await FAQ.findByIdAndDelete(id);
  }

  async bulkUpdateOrder(updates) {
    const ops = updates.map(update => ({
      updateOne: {
        filter: { _id: update.id },
        update: { order: update.order }
      }
    }));
    return await FAQ.bulkWrite(ops);
  }
}

module.exports = new FAQRepository();
