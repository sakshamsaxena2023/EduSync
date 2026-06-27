const express = require('express');
const router = express.Router();
const {
  createChallenge,
  respondToChallenge,
  getLeaderboard,
  getMyChallenges,
  completeChallenge
} = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createChallenge);
router.put('/:id', respondToChallenge);
router.get('/leaderboard', getLeaderboard);
router.get('/my-challenges', getMyChallenges);
router.post('/:id/complete', completeChallenge);

module.exports = router;
