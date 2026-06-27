const User = require('../models/User');
const StudyGroup = require('../models/StudyGroup');

// Helper to convert a User model instance into a normalized numerical feature vector
const vectorizeUser = (user) => {
  // 1. Skill Level: beginner=0.1, intermediate=0.5, advanced=1.0
  let skillVal = 0.1;
  if (user.skillLevel === 'intermediate') skillVal = 0.5;
  if (user.skillLevel === 'advanced') skillVal = 1.0;

  // 2. Availability: Scale hours/week to [0, 1] assuming max is 40 hours
  const availVal = Math.min(Math.max(user.availability || 0, 0), 40) / 40.0;

  // 3. Preferred Schedule: morning=0.25, afternoon=0.5, evening=0.75, night=1.0
  let schedVal = 0.75; // default evening
  if (user.preferredSchedule === 'morning') schedVal = 0.25;
  if (user.preferredSchedule === 'afternoon') schedVal = 0.5;
  if (user.preferredSchedule === 'night') schedVal = 1.0;

  // 4. Learning Goals: Map top goals into simple 4-dimensional binary vector
  // Categories: DSA, Web Dev, AI/ML, System Design
  const goals = user.learningGoals || [];
  const goalDSA = goals.some(g => g.toLowerCase().includes('dsa') || g.toLowerCase().includes('leetcode') || g.toLowerCase().includes('algorithm')) ? 1.0 : 0.0;
  const goalWeb = goals.some(g => g.toLowerCase().includes('web') || g.toLowerCase().includes('frontend') || g.toLowerCase().includes('backend') || g.toLowerCase().includes('react')) ? 1.0 : 0.0;
  const goalAI = goals.some(g => g.toLowerCase().includes('ai') || g.toLowerCase().includes('ml') || g.toLowerCase().includes('intelligence') || g.toLowerCase().includes('python')) ? 1.0 : 0.0;
  const goalSys = goals.some(g => g.toLowerCase().includes('system') || g.toLowerCase().includes('architecture') || g.toLowerCase().includes('design')) ? 1.0 : 0.0;

  return [skillVal, availVal, schedVal, goalDSA, goalWeb, goalAI, goalSys];
};

// Euclidean distance between two vectors
const euclideanDistance = (v1, v2) => {
  if (v1.length !== v2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    sum += Math.pow(v1[i] - v2[i], 2);
  }
  return Math.sqrt(sum);
};

// Custom K-Means Clustering Algorithm
const runKMeansClustering = (users, K, maxIterations = 100) => {
  if (users.length === 0) return [];
  if (users.length <= K) {
    // If fewer or equal users than K, each user gets their own cluster
    return users.map((user, idx) => ({
      centroid: vectorizeUser(user),
      userIds: [user._id.toString()],
      clusterIndex: idx
    }));
  }

  // Vectorize all users
  const userVectors = users.map(user => ({
    userId: user._id.toString(),
    vector: vectorizeUser(user)
  }));

  const vectorLength = userVectors[0].vector.length;

  // Initialize centroids randomly selecting unique user vectors
  let centroids = [];
  const shuffled = [...userVectors].sort(() => 0.5 - Math.random());
  for (let i = 0; i < K; i++) {
    centroids.push([...shuffled[i].vector]);
  }

  let clusters = Array.from({ length: K }, () => []);
  let converged = false;
  let iteration = 0;

  while (!converged && iteration < maxIterations) {
    iteration++;
    // 1. Reset clusters
    clusters = Array.from({ length: K }, () => []);

    // 2. Assign each user to the closest centroid
    userVectors.forEach(uv => {
      let minDistance = Infinity;
      let closestClusterIndex = 0;

      centroids.forEach((centroid, idx) => {
        const dist = euclideanDistance(uv.vector, centroid);
        if (dist < minDistance) {
          minDistance = dist;
          closestClusterIndex = idx;
        }
      });

      clusters[closestClusterIndex].push(uv);
    });

    // 3. Compute new centroids as the mean of all vectors in that cluster
    let newCentroids = [];
    converged = true;

    for (let cIdx = 0; cIdx < K; cIdx++) {
      const clusterVectors = clusters[cIdx];
      if (clusterVectors.length === 0) {
        // If a cluster becomes empty, keep the old centroid or re-initialize randomly
        newCentroids.push([...centroids[cIdx]]);
        continue;
      }

      const meanVector = Array(vectorLength).fill(0);
      clusterVectors.forEach(uv => {
        for (let dim = 0; dim < vectorLength; dim++) {
          meanVector[dim] += uv.vector[dim];
        }
      });

      for (let dim = 0; dim < vectorLength; dim++) {
        meanVector[dim] /= clusterVectors.length;
      }

      // Check if centroid shifted
      const shift = euclideanDistance(centroids[cIdx], meanVector);
      if (shift > 0.0001) {
        converged = false;
      }

      newCentroids.push(meanVector);
    }

    centroids = newCentroids;
  }

  return clusters.map((cluster, idx) => ({
    centroid: centroids[idx],
    userIds: cluster.map(c => c.userId),
    clusterIndex: idx
  }));
};

// Main function to cluster users and rebuild study groups accordingly in MongoDB
const rebuildClustersAndGroups = async (overrideK = null) => {
  try {
    // 1. Fetch all users who have completed their profile onboarding
    const users = await User.find({ profileCompleted: true });
    if (users.length === 0) {
      console.log('No onboarding-completed users found for clustering.');
      return;
    }

    // 2. Dynamically determine K if not overridden (Target size of ~4 users per group)
    const K = overrideK || Math.max(1, Math.floor(users.length / 4));
    console.log(`Clustering ${users.length} students into K = ${K} groups.`);

    // 3. Run clustering algorithm
    const clusters = runKMeansClustering(users, K);

    // 4. Update users with their new clusterId and organize Mongoose StudyGroups
    for (let cIdx = 0; cIdx < clusters.length; cIdx++) {
      const cluster = clusters[cIdx];
      const memberIds = cluster.userIds;

      // Update User cluster IDs in DB
      await User.updateMany(
        { _id: { $in: memberIds } },
        { $set: { clusterId: cIdx } }
      );

      // Create or update a Study Group for this cluster
      let group = await StudyGroup.findOne({ clusterId: cIdx });

      const topics = ["Algorithms & DSA", "Web Development", "AI & Machine Learning", "System Design"];
      const chosenTopic = topics[cIdx % topics.length];

      if (!group) {
        group = new StudyGroup({
          name: `EduSync Study Group ${String.fromCharCode(65 + cIdx)}`,
          description: `Automatically created collaborative group for similar learning profiles in ${chosenTopic}.`,
          topic: chosenTopic,
          members: memberIds,
          clusterId: cIdx,
          tasks: [
            { title: "Introduce yourself to the group!", description: "Share your handles and experience levels.", status: "todo" },
            { title: "Coordinate your first mock coding sprint", description: "Schedule a timing using chat.", status: "todo" }
          ]
        });
      } else {
        group.members = memberIds;
      }

      await group.save();
    }

    console.log('K-Means clustering and study group synchronization complete.');
    return clusters;
  } catch (error) {
    console.error('Error during cluster rebuild:', error);
    throw error;
  }
};

module.exports = {
  vectorizeUser,
  euclideanDistance,
  runKMeansClustering,
  rebuildClustersAndGroups
};
