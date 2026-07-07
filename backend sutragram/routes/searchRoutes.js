import express from 'express';
import {
    search,
    searchCrafts,
    searchArtisansByLocation,
} from '../controllers/searchController.js';

const router = express.Router();

// Search routes
router.get('/', search);
router.get('/crafts', searchCrafts);
router.get('/artisans/location', searchArtisansByLocation);

export default router;
