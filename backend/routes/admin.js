const express = require('express');
const router = express.Router();
const { getStats, triggerClustering } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// In production, we'd add an admin verification middleware here
router.use(protect);

router.get('/stats', getStats);
router.post('/run-clustering', triggerClustering);

module.exports = router;
