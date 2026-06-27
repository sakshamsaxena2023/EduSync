import React, { useState, useEffect } from 'react';
import { Trophy, Award, Medal, ShieldAlert, Sparkles, Star } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

const Leaderboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/challenges/leaderboard`);
      setGroups(res.data);
    } catch (err) {
      console.error('Error fetching leaderboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div class="flex items-center justify-center min-h-[300px]">
        <span class="animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent"></span>
      </div>
    );
  }

  return (
    <div class="max-w-4xl mx-auto bg-darkCard border border-darkBorder rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div class="absolute w-36 h-36 bg-violet-600/5 rounded-full blur-xl -top-10 -right-10"></div>
      
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <Trophy class="w-5 h-5 text-yellow-500" />
            <span>EduSync Global Leaderboard</span>
          </h2>
          <p class="text-xs text-gray-400 mt-1">Study groups ranked by completed sprints and collaborative task updates.</p>
        </div>
        <button onClick={fetchLeaderboard} class="px-3 py-1.5 bg-darkBg border border-darkBorder rounded-lg text-xs text-gray-400 hover:text-white transition-all">
          Refresh
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-darkBorder text-gray-400 text-xs font-semibold uppercase tracking-wider">
              <th class="py-3 px-4 text-center">Rank</th>
              <th class="py-3 px-4">Study Group</th>
              <th class="py-3 px-4">Topic / Stack Focus</th>
              <th class="py-3 px-4 text-center">Members</th>
              <th class="py-3 px-4 text-right">Points Score</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-darkBorder/40">
            {groups.length > 0 ? (
              groups.map((group, index) => {
                const isTopThree = index < 3;
                const medalColor = index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-300' : 'text-amber-600';
                
                return (
                  <tr key={group._id} class={`text-sm hover:bg-darkBg/30 transition-colors ${isTopThree ? 'font-semibold text-white' : 'text-gray-300'}`}>
                    <td class="py-4 px-4 text-center">
                      {isTopThree ? (
                        <div class="flex justify-center">
                          <Award class={`w-5 h-5 ${medalColor}`} />
                        </div>
                      ) : (
                        <span class="text-gray-500 text-xs">{index + 1}</span>
                      )}
                    </td>
                    <td class="py-4 px-4">
                      <div>
                        <span>{group.name}</span>
                        {index === 0 && <span class="ml-2 text-[9px] bg-yellow-950/40 text-yellow-400 border border-yellow-800/40 px-1.5 py-0.5 rounded font-black">CHAMPION</span>}
                      </div>
                    </td>
                    <td class="py-4 px-4">
                      <span class="text-xs text-violet-400 bg-violet-950/20 border border-violet-900/20 px-2 py-0.5 rounded uppercase font-semibold">
                        {group.topic}
                      </span>
                    </td>
                    <td class="py-4 px-4 text-center">
                      <span class="text-xs bg-darkBg border border-darkBorder px-2 py-1 rounded-full text-gray-400">
                        {group.members?.length || 0}
                      </span>
                    </td>
                    <td class="py-4 px-4 text-right font-black text-violet-400 text-base">
                      {group.points} <span class="text-[10px] text-gray-500 font-normal">pts</span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" class="py-12 text-center text-xs text-gray-500">
                  No active study groups ranked yet. Start or join a study group and complete tasks to gain points.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
