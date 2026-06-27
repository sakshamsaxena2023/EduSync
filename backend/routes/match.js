const express = require('express');
const router = express.Router();
const {
  updateProfile,
  getRecommendations,
  sendRequest,
  respondRequest,
  getRequests
} = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.put('/profile', updateProfile);
router.get('/recommendations', getRecommendations);
router.post('/request', sendRequest);
router.put('/request/:id', respondRequest);
router.get('/requests', getRequests);

module.exports = router;
