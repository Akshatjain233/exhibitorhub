const PageView = require('../models/PageView');

class AnalyticsRepository {
  async createPageView(data) {
    return await PageView.create(data);
  }

  async aggregatePageViews(pipeline) {
    return await PageView.aggregate(pipeline);
  }

  async countPageViews(query) {
    return await PageView.countDocuments(query);
  }
}

module.exports = new AnalyticsRepository();
