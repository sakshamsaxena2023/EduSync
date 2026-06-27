const User = require('../models/User');
const StudyRequest = require('../models/StudyRequest');
const { vectorizeUser, euclideanDistance } = require('../utils/kmeans');

// @desc    Update student onboarding profile
// @route   PUT /api/match/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  const { leetcodeUsername, codeforcesUsername, techStack, skillLevel, availability, preferredSchedule, learningGoals } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.leetcodeUsername = leetcodeUsername || user.leetcodeUsername;
    user.codeforcesUsername = codeforcesUsername || user.codeforcesUsername;
    user.techStack = techStack || user.techStack;
    user.skillLevel = skillLevel || user.skillLevel;
    user.availability = availability || user.availability;
    user.preferredSchedule = preferredSchedule || user.preferredSchedule;
    user.learningGoals = learningGoals || user.learningGoals;
    user.profileCompleted = true;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get matching peer recommendations based on Euclidean compatibility
// @route   GET /api/match/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || !currentUser.profileCompleted) {
      return res.status(400).json({ message: 'Please complete your onboarding profile first.' });
    }

    // Find already requested or already connected users
    const sentRequests = await StudyRequest.find({ sender: currentUser._id }).select('receiver');
    const receivedRequests = await StudyRequest.find({ receiver: currentUser._id }).select('sender');
    
    const excludedIds = [
      currentUser._id.toString(),
      ...currentUser.connectedPeers.map(id => id.toString()),
      ...sentRequests.map(req => req.receiver.toString()),
      ...receivedRequests.map(req => req.sender.toString())
    ];

    // Get all other users who completed profile onboarding
    const potentialMatches = await User.find({
      _id: { $nin: excludedIds },
      profileCompleted: true
    }).select('-password');

    const currentUserVector = vectorizeUser(currentUser);

    // Calculate compatibility score for each potential match
    const recommendations = potentialMatches.map(match => {
      const matchVector = vectorizeUser(match);
      const dist = euclideanDistance(currentUserVector, matchVector);
      
      // Max possible distance is sqrt(7) ≈ 2.6457
      // Calculate matching percentage
      const maxDistance = Math.sqrt(7);
      const compatibility = Math.max(0, Math.min(100, Math.round((1 - (dist / maxDistance)) * 100)));

      return {
        user: match,
        compatibility
      };
    });

    // Sort by highest compatibility
    recommendations.sort((a, b) => b.compatibility - a.compatibility);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a study connection request
// @route   POST /api/match/request
// @access  Private
exports.sendRequest = async (req, res) => {
  const { receiverId } = req.body;

  try {
    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver user ID required' });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver user not found' });
    }

    // Create request
    const request = new StudyRequest({
      sender: req.user.id,
      receiver: receiverId,
      status: 'pending'
    });

    await request.save();
    res.status(201).json({ message: 'Study request sent successfully', request });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Request already exists between these users' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond (accept/decline) to study request
// @route   PUT /api/match/request/:id
// @access  Private
exports.respondRequest = async (req, res) => {
  const { status } = req.body; // 'accepted' or 'declined'
  const requestId = req.params.id;

  try {
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status response' });
    }

    const request = await StudyRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Study request not found' });
    }

    // Verify that the receiver of the request is responding
    if (request.receiver.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to respond to this request' });
    }

    request.status = status;
    await request.save();

    if (status === 'accepted') {
      // Connect users
      await User.findByIdAndUpdate(request.sender, { $addToSet: { connectedPeers: request.receiver } });
      await User.findByIdAndUpdate(request.receiver, { $addToSet: { connectedPeers: request.sender } });
    }

    // Delete request since resolved
    await StudyRequest.findByIdAndDelete(requestId);

    res.json({ message: `Study request ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's pending incoming and outgoing requests
// @route   GET /api/match/requests
// @access  Private
exports.getRequests = async (req, res) => {
  try {
    const incoming = await StudyRequest.find({ receiver: req.user.id, status: 'pending' })
      .populate('sender', 'name email skillLevel techStack learningGoals');

    const outgoing = await StudyRequest.find({ sender: req.user.id, status: 'pending' })
      .populate('receiver', 'name email skillLevel techStack learningGoals');

    res.json({ incoming, outgoing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
