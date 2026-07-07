const analyticsRepository = require('../repositories/analyticsRepository');
const mongoose = require('mongoose');

class AnalyticsService {
  async trackView(data, userId, ipAddress, userAgent) {
    const pageView = {
      ...data,
      user: userId || null,
      ipAddress,
      userAgent
    };
    return await analyticsRepository.createPageView(pageView);
  }

  async getExhibitionAnalytics(exhibitionId) {
    if (!exhibitionId) throw new Error('Exhibition ID is required');

    const totalViews = await analyticsRepository.countPageViews({ exhibition: exhibitionId });

    // Group by targetType
    const viewsByTypePipeline = [
      { $match: { exhibition: new mongoose.Types.ObjectId(exhibitionId) } },
      { $group: { _id: '$targetType', count: { $sum: 1 } } }
    ];
    const viewsByType = await analyticsRepository.aggregatePageViews(viewsByTypePipeline);

    // Top Exhibitors
    const topExhibitorsPipeline = [
      { $match: { exhibition: new mongoose.Types.ObjectId(exhibitionId), targetType: 'exhibitor' } },
      { $group: { _id: '$targetId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'exhibitors', localField: '_id', foreignField: '_id', as: 'exhibitor' } },
      { $unwind: '$exhibitor' },
      { $project: { _id: 1, count: 1, 'exhibitor.companyName': 1 } }
    ];
    const topExhibitors = await analyticsRepository.aggregatePageViews(topExhibitorsPipeline);

    // Top Products
    const topProductsPipeline = [
      { $match: { exhibition: new mongoose.Types.ObjectId(exhibitionId), targetType: 'product' } },
      { $group: { _id: '$targetId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { _id: 1, count: 1, 'product.name': 1 } }
    ];
    const topProducts = await analyticsRepository.aggregatePageViews(topProductsPipeline);

    return {
      totalViews,
      viewsByType,
      topExhibitors,
      topProducts
    };
  }

  async getExhibitorAnalytics(exhibitionId, exhibitorProfileId) {
    if (!exhibitionId || !exhibitorProfileId) throw new Error('Exhibition ID and Exhibitor Profile ID are required');

    const profileViews = await analyticsRepository.countPageViews({ 
      exhibition: exhibitionId, 
      targetType: 'exhibitor',
      targetId: exhibitorProfileId
    });

    // Product Views for this exhibitor (requires looking up products belonging to this exhibitor)
    // For simplicity, if we pass targetId as the exhibitor ID when viewing a product, or if we join...
    // Let's assume frontend calls trackView with targetType='product', targetId=productId. 
    // We would need to join products collection to filter by exhibitor.

    const productViewsPipeline = [
      { $match: { exhibition: new mongoose.Types.ObjectId(exhibitionId), targetType: 'product' } },
      { $lookup: { from: 'products', localField: 'targetId', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $match: { 'product.exhibitor': new mongoose.Types.ObjectId(exhibitorProfileId) } },
      { $group: { _id: '$targetId', count: { $sum: 1 }, name: { $first: '$product.name' } } },
      { $sort: { count: -1 } }
    ];
    
    const productViews = await analyticsRepository.aggregatePageViews(productViewsPipeline);

    return {
      profileViews,
      productViews
    };
  }
}

module.exports = new AnalyticsService();
