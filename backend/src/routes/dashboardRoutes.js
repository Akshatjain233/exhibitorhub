const express = require('express');
const { getKpis, getActivities } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/kpis', getKpis);
router.get('/activities', getActivities);

module.exports = router;
