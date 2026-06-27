import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import { Cpu, Users, Layers, Award, Terminal, Play, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clusteringLoading, setClusteringLoading] = useState(false);
  const [clusteringResult, setClusteringResult] = useState(null);
  const [logMessages, setLogMessages] = useState([]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const runClusteringEngine = async () => {
    try {
      setClusteringLoading(true);
      setLogMessages(['[ML ENGINE] Initializing K-Means Clustering...', '[ML ENGINE] Fetching student vector profiles from database...']);
      
      const res = await axios.post(`${API_URL}/admin/run-clustering`);
      
      setLogMessages(prev => [
        ...prev,
        `[ML ENGINE] Loaded ${res.data.clusters?.length || 0} clusters.`,
        '[ML ENGINE] Storing cluster IDs and rebuilding study groups in MongoDB...',
        '[ML ENGINE] Optimization process completed successfully!'
      ]);
      setClusteringResult(res.data);
      fetchStats();
    } catch (err) {
      setLogMessages(prev => [...prev, `[ERROR] Clustering calculation failed: ${err.message}`]);
    } finally {
      setClusteringLoading(false);
    }
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center min-h-[300px]">
        <span class="animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent"></span>
      </div>
    );
  }

  const metrics = stats?.metrics || { totalUsers: 0, completedProfiles: 0, totalGroups: 0, totalChallenges: 0 };
  const students = stats?.students || [];

  return (
    <div class="space-y-6">
      
      {/* Metrics Row */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Enrolled', val: metrics.totalUsers, color: 'text-violet-400 bg-violet-600/10' },
          { icon: CheckCircle, label: 'Onboarded Profiles', val: metrics.completedProfiles, color: 'text-emerald-400 bg-emerald-600/10' },
          { icon: Layers, label: 'Active Study Groups', val: metrics.totalGroups, color: 'text-blue-400 bg-blue-600/10' },
          { icon: Award, label: 'Sprint Challenges', val: metrics.totalChallenges, color: 'text-fuchsia-400 bg-fuchsia-600/10' }
        ].map((card, idx) => (
          <div key={idx} class="bg-darkCard border border-darkBorder rounded-xl p-4 shadow flex items-center gap-3">
            <div class={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
              <card.icon class="w-5 h-5" />
            </div>
            <div>
              <span class="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">{card.label}</span>
              <span class="text-lg font-black text-white">{card.val}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panel Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* ML Engine Control Room (Left 2 cols) */}
        <div class="lg:col-span-2 bg-darkCard border border-darkBorder rounded-2xl p-5 shadow-xl flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 class="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Cpu class="w-4 h-4 text-violet-400" />
              <span>K-Means Clustering Engine</span>
            </h3>
            <p class="text-xs text-gray-400 mb-4">Run the clustering calculation from scratch in JavaScript. This will segment students based on their profile vectors and re-assign them to customized study groups.</p>
          </div>

          {/* Log Messages Console */}
          <div class="bg-darkBg/80 border border-darkBorder p-3 rounded-lg flex-1 font-mono text-[9px] text-emerald-400 space-y-1.5 overflow-y-auto mb-4 max-h-[160px]">
            {logMessages.length > 0 ? (
              logMessages.map((msg, i) => <div key={i}>{msg}</div>)
            ) : (
              <div class="text-gray-600">Console idle. Click run below to begin calculation.</div>
            )}
          </div>

          <button
            onClick={runClusteringEngine}
            disabled={clusteringLoading}
            class="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow shadow-violet-600/20 transition-all"
          >
            {clusteringLoading ? (
              <span class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <Play class="w-4 h-4" /> Run K-Means Engine
              </>
            )}
          </button>
        </div>

        {/* Students Profiles Database (Right 3 cols) */}
        <div class="lg:col-span-3 bg-darkCard border border-darkBorder rounded-2xl p-5 shadow-xl flex flex-col min-h-[350px]">
          <h3 class="text-sm font-bold text-white mb-3">Student Registry</h3>
          
          <div class="flex-1 overflow-y-auto max-h-[260px] pr-1">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-darkBorder text-gray-500 pb-2">
                  <th class="pb-2">Name / Email</th>
                  <th class="pb-2">Onboarded</th>
                  <th class="pb-2">Cluster ID</th>
                  <th class="pb-2">Experience</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-darkBorder/30">
                {students.map((student) => (
                  <tr key={student._id} class="hover:bg-darkBg/20">
                    <td class="py-2.5">
                      <div class="font-semibold text-white">{student.name}</div>
                      <div class="text-[9px] text-gray-500">{student.email}</div>
                    </td>
                    <td class="py-2.5">
                      <span class={`px-1.5 py-0.5 rounded text-[8px] font-bold ${student.profileCompleted ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' : 'bg-amber-950 text-amber-400 border border-amber-900/30'}`}>
                        {student.profileCompleted ? 'Yes' : 'Pending'}
                      </span>
                    </td>
                    <td class="py-2.5">
                      <span class={`font-mono ${student.clusterId !== -1 ? 'text-violet-400 font-bold' : 'text-gray-500'}`}>
                        {student.clusterId !== -1 ? `Cluster ${student.clusterId}` : 'None'}
                      </span>
                    </td>
                    <td class="py-2.5 capitalize text-gray-400">
                      {student.skillLevel || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
