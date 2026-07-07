import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import {
    getTraderProfile,
    updateTraderProfile,
    getLeads,
    requestQuote,
    getTraderStats,
    addTraderMaterial,
    updateTraderMaterial,
    deleteTraderMaterial,
    getMyTraderMaterials,
    quoteProduct,
    createBulkProductOrder,
} from '../controllers/traderController.js';
import {
    addMaterial,
    updateMaterial,
    deleteMaterial,
    getMyMaterials,
    getAllMaterials,
    getMaterialById,
    validateMaterialsForQuote,
} from '../controllers/inventoryController.js';
import {
    generateLeads,
    trackLeadUsage,
    getTrackedLeads,
    getInvoices,
} from '../controllers/leadController.js';
import {
    getMyOrders,
    createB2BOrder,
    getB2BOrders,
    getB2BOrderById,
    updateB2BOrderStatus,
} from '../controllers/orderController.js';
import {
    getSupplierProfile,
    updateSupplierProfile,
    getArtisanLeads,
    upgradeToPremium,
    trackLeadAccess,
    getSupplierAnalytics,
    getCreditTransactionHistory,
    getSupplierPerformanceAnalytics,
} from '../controllers/supplierController.js';

const router = express.Router();

// Trader routes — static routes BEFORE parameterized /:id
router.get('/trader/leads', protect, restrictTo('trader'), getLeads);
router.post('/trader/quote-request', protect, restrictTo('trader', 'artisan'), requestQuote);
router.get('/trader/stats', protect, restrictTo('trader'), getTraderStats);
router.get('/trader/my-materials', protect, restrictTo('trader'), getMyTraderMaterials);
router.post('/trader/materials', protect, restrictTo('trader'), addTraderMaterial);
router.patch('/trader/materials/:id', protect, restrictTo('trader'), updateTraderMaterial);
router.delete('/trader/materials/:id', protect, restrictTo('trader'), deleteTraderMaterial);
router.post('/trader/quote-product', protect, restrictTo('trader'), quoteProduct);
router.post('/trader/bulk-product-order', protect, restrictTo('trader'), createBulkProductOrder);
router.get('/trader/:id', protect, restrictTo('trader', 'admin'), getTraderProfile);
router.put('/trader/:id', protect, restrictTo('trader'), updateTraderProfile);
router.get('/invoices', protect, restrictTo('trader'), getInvoices);

// Supplier routes
router.get('/supplier/profile', protect, restrictTo('supplier'), getSupplierProfile);
router.put('/supplier/profile', protect, restrictTo('supplier'), updateSupplierProfile);
router.get('/supplier/leads', protect, restrictTo('supplier'), getArtisanLeads);
router.post('/supplier/leads/:artisan_id/track', protect, restrictTo('supplier'), trackLeadAccess);
router.post('/supplier/upgrade-premium', protect, restrictTo('supplier'), upgradeToPremium);
router.get('/supplier/analytics', protect, restrictTo('supplier'), getSupplierAnalytics);
router.get('/supplier/credits/history', protect, restrictTo('supplier'), getCreditTransactionHistory);
router.get('/supplier/analytics/performance', protect, restrictTo('supplier'), getSupplierPerformanceAnalytics);

// Inventory (Raw Materials) routes — trader only
router.post('/inventory', protect, restrictTo('trader'), addMaterial);
router.get('/inventory/my-materials', protect, restrictTo('trader'), getMyMaterials);
router.get('/products/my-inventory', protect, restrictTo('trader'), getMyMaterials);
router.post('/inventory/validate', protect, restrictTo('trader', 'artisan'), validateMaterialsForQuote);
router.get('/inventory/:id', protect, restrictTo('trader'), getMaterialById);
router.put('/inventory/:id', protect, restrictTo('trader'), updateMaterial);
router.delete('/inventory/:id', protect, restrictTo('trader'), deleteMaterial);
router.get('/inventory', getAllMaterials);

// Lead routes
router.post('/leads/generate', protect, restrictTo('admin'), generateLeads);
router.post('/leads/:id/track', protect, restrictTo('trader'), trackLeadUsage);
router.get('/leads', protect, restrictTo('trader'), getTrackedLeads);

// B2B Orders - trader only
router.get('/orders', protect, restrictTo('trader', 'artisan'), getMyOrders);
router.post('/orders', protect, restrictTo('trader', 'artisan'), createB2BOrder);
router.get('/b2b-orders', protect, restrictTo('trader', 'artisan'), getB2BOrders);
router.get('/orders/:id', protect, restrictTo('trader', 'artisan'), getB2BOrderById);
router.put('/orders/:id/status', protect, restrictTo('trader', 'artisan'), updateB2BOrderStatus);

export default router;
