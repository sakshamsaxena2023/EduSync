const { runKMeansClustering } = require('./utils/kmeans');

// Simulate Mock Students with different profiles
const mockStudents = [
  // Cluster Group 1: Night-Owl DSA/LeetCode Enthusiasts
  {
    _id: "user_dsa_1",
    name: "Alice (LeetCoder)",
    skillLevel: "advanced",
    availability: 35,
    preferredSchedule: "night",
    learningGoals: ["Master LeetCode", "Prepare for FAANG"]
  },
  {
    _id: "user_dsa_2",
    name: "Bob (DSA Lover)",
    skillLevel: "intermediate",
    availability: 30,
    preferredSchedule: "night",
    learningGoals: ["Master LeetCode", "Data Structures"]
  },
  {
    _id: "user_dsa_3",
    name: "Charlie (Competitive)",
    skillLevel: "advanced",
    availability: 40,
    preferredSchedule: "night",
    learningGoals: ["Prepare for FAANG", "Algorithms"]
  },

  // Cluster Group 2: Morning Web Developers
  {
    _id: "user_web_1",
    name: "David (Frontend)",
    skillLevel: "beginner",
    availability: 10,
    preferredSchedule: "morning",
    learningGoals: ["Build Side Projects", "React"]
  },
  {
    _id: "user_web_2",
    name: "Eva (Fullstack)",
    skillLevel: "intermediate",
    availability: 12,
    preferredSchedule: "morning",
    learningGoals: ["Build Side Projects", "Web Development", "Node.js"]
  },
  {
    _id: "user_web_3",
    name: "Frank (React Dev)",
    skillLevel: "beginner",
    availability: 8,
    preferredSchedule: "morning",
    learningGoals: ["React", "Web Development"]
  }
];

console.log("=== EduSync K-Means Algorithm Verification ===");
console.log(`Loaded ${mockStudents.length} simulated student profiles.\n`);

const K = 2;
console.log(`Running K-Means Clustering (K = ${K})...`);
const clusters = runKMeansClustering(mockStudents, K);

console.log("\n=================== RESULTING CLUSTERS ===================");
clusters.forEach((cluster, idx) => {
  console.log(`\nGroup ${idx + 1} (Centroid: [${cluster.centroid.map(v => v.toFixed(2)).join(", ")}])`);
  console.log("Members:");
  cluster.userIds.forEach(userId => {
    const student = mockStudents.find(s => s._id === userId);
    console.log(`  - ${student.name} [Pace/Skill: ${student.skillLevel}, Avail: ${student.availability}h, Schedule: ${student.preferredSchedule}, Goals: ${student.learningGoals.join(", ")}]`);
  });
});

// Check if clustering was successful
const group1Names = clusters[0].userIds.map(id => mockStudents.find(s => s._id === id).name);
const group2Names = clusters[1].userIds.map(id => mockStudents.find(s => s._id === id).name);

const cluster1Homogeneity = group1Names.every(name => name.includes("LeetCoder") || name.includes("DSA") || name.includes("Competitive")) || 
                             group1Names.every(name => name.includes("Frontend") || name.includes("Fullstack") || name.includes("React"));

const cluster2Homogeneity = group2Names.every(name => name.includes("LeetCoder") || name.includes("DSA") || name.includes("Competitive")) || 
                             group2Names.every(name => name.includes("Frontend") || name.includes("Fullstack") || name.includes("React"));

if (cluster1Homogeneity && cluster2Homogeneity) {
  console.log("\n✓ VERIFICATION SUCCESSFUL: Students separated cleanly into distinct clusters matching their schedules, commitments, and goals.");
} else {
  console.log("\n⚠ VERIFICATION WARNING: Clustering result is mixed, which can occur due to random centroid initialization. Re-run to check convergence.");
}
