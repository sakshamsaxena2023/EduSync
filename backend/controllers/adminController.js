const User = require('../models/User');
const StudyGroup = require('../models/StudyGroup');
const Challenge = require('../models/Challenge');
const { rebuildClustersAndGroups } = require('../utils/kmeans');

// @desc    Get dashboard metrics for Admin panel
// @route   GET /api/admin/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const completedProfiles = await User.countDocuments({ profileCompleted: true });
    const totalGroups = await StudyGroup.countDocuments();
    const totalChallenges = await Challenge.countDocuments();

    // Fetch simple list of all students for overview
    const students = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      metrics: {
        totalUsers,
        completedProfiles,
        totalGroups,
        totalChallenges
      },
      students
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Trigger K-Means Clustering run manually
// @route   POST /api/admin/run-clustering
// @access  Private
exports.triggerClustering = async (req, res) => {
  try {
    const clusters = await rebuildClustersAndGroups();
    res.json({
      message: 'K-Means clustering triggered successfully and Study Groups rebuilt.',
      clustersCount: clusters ? clusters.length : 0,
      clusters
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
