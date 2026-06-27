const Challenge = require('../models/Challenge');
const StudyGroup = require('../models/StudyGroup');

// @desc    Challenge another study group
// @route   POST /api/challenges
// @access  Private
exports.createChallenge = async (req, res) => {
  const { targetGroupId, challengeType, daysDuration } = req.body;

  try {
    if (!targetGroupId || !challengeType) {
      return res.status(400).json({ message: 'Target group ID and challenge type are required' });
    }

    // Find challenger group (user's current group)
    const challengerGroup = await StudyGroup.findOne({ members: req.user.id });
    if (!challengerGroup) {
      return res.status(400).json({ message: 'You must belong to a study group to issue a challenge.' });
    }

    if (challengerGroup._id.toString() === targetGroupId) {
      return res.status(400).json({ message: 'You cannot challenge your own group.' });
    }

    const duration = daysDuration || 3;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const challenge = new Challenge({
      challengerGroup: challengerGroup._id,
      targetGroup: targetGroupId,
      challengeType,
      pointsBounty: 150, // standard bounty
      startDate,
      endDate,
      status: 'pending'
    });

    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to challenge (accept/decline)
// @route   PUT /api/challenges/:id
// @access  Private
exports.respondToChallenge = async (req, res) => {
  const { status } = req.body; // 'accepted' or 'declined'
  const challengeId = req.params.id;

  try {
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid response status' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Verify user is in the target group
    const userGroup = await StudyGroup.findOne({ _id: challenge.targetGroup, members: req.user.id });
    if (!userGroup) {
      return res.status(401).json({ message: 'Only members of the target group can respond to this challenge.' });
    }

    challenge.status = status;
    await challenge.save();

    res.json({ message: `Challenge ${status} successfully`, challenge });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard rankings
// @route   GET /api/challenges/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
  try {
    // Rank groups by accumulated points
    const groups = await StudyGroup.find()
      .populate('members', 'name email')
      .sort({ points: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user group's challenges
// @route   GET /api/challenges/my-challenges
// @access  Private
exports.getMyChallenges = async (req, res) => {
  try {
    const userGroup = await StudyGroup.findOne({ members: req.user.id });
    if (!userGroup) {
      return res.json({ incoming: [], outgoing: [] });
    }

    const incoming = await Challenge.find({ targetGroup: userGroup._id })
      .populate('challengerGroup', 'name topic points')
      .populate('winnerGroup', 'name');

    const outgoing = await Challenge.find({ challengerGroup: userGroup._id })
      .populate('targetGroup', 'name topic points')
      .populate('winnerGroup', 'name');

    res.json({ incoming, outgoing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete challenge and assign winner
// @route   POST /api/challenges/:id/complete
// @access  Private
exports.completeChallenge = async (req, res) => {
  const { winnerGroupId } = req.body;
  const challengeId = req.params.id;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted challenges can be completed' });
    }

    // Verify winner is either the challenger or target
    if (winnerGroupId !== challenge.challengerGroup.toString() && winnerGroupId !== challenge.targetGroup.toString()) {
      return res.status(400).json({ message: 'Winner group must be one of the participating groups.' });
    }

    challenge.status = 'completed';
    challenge.winnerGroup = winnerGroupId;
    await challenge.save();

    // Reward points to winner
    await StudyGroup.findByIdAndUpdate(winnerGroupId, { $inc: { points: challenge.pointsBounty } });

    res.json({ message: 'Challenge marked completed. Points awarded.', challenge });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
