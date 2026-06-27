import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, API_URL } from '../context/AuthContext';
import axios from 'axios';
import { UserCheck, Zap, LogOut, Code, Calendar, Users, Trophy, Settings, ShieldAlert, Sparkles, Send, X, Check } from 'lucide-react';

const Dashboard = ({ setActiveTab }) => {
  const { user, logout, refreshProfile } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [connectedPeers, setConnectedPeers] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const [actionMessage, setActionMessage] = useState('');

  // Fetch Recommendations & Requests
  const fetchData = async () => {
    try {
      setLoadingMatches(true);
      // Fetch peers recommendations
      const recsRes = await axios.get(`${API_URL}/match/recommendations`);
      setRecommendations(recsRes.data);
      setCurrentMatchIdx(0);

      // Fetch requests
      const reqRes = await axios.get(`${API_URL}/match/requests`);
      setIncomingRequests(reqRes.data.incoming);
      
      // Load connected peers details
      if (user && user.connectedPeers) {
        setConnectedPeers(user.connectedPeers);
      }
    } catch (err) {
      console.error('Error fetching dashboard metrics', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle Swipe/Connect Request
  const handleConnect = async (receiverId) => {
    try {
      await axios.post(`${API_URL}/match/request`, { receiverId });
      setActionMessage('✨ Connection request sent!');
      setTimeout(() => setActionMessage(''), 2000);
      
      // Remove from active recommendations list on swipe/action
      setRecommendations(recommendations.filter((_, idx) => idx !== currentMatchIdx));
    } catch (err) {
      console.error('Error sending connect request', err);
    }
  };

  const handleSkip = () => {
    // Just move to the next recommendation card index
    if (currentMatchIdx < recommendations.length - 1) {
      setCurrentMatchIdx(currentMatchIdx + 1);
    } else {
      setRecommendations([]);
    }
  };

  // Handle Request Responses
  const handleRequestResponse = async (requestId, status) => {
    try {
      await axios.put(`${API_URL}/match/request/${requestId}`, { status });
      await refreshProfile();
      fetchData();
    } catch (err) {
      console.error('Error responding to request', err);
    }
  };

  const activeMatch = recommendations[currentMatchIdx];

  return (
    <div class="space-y-6">
      
      {/* Overview Cards */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div class="bg-darkCard border border-darkBorder rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div class="absolute w-24 h-24 bg-violet-600/10 rounded-full blur-xl -top-6 -left-6"></div>
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Code class="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h4 class="font-bold text-white text-base">{user?.name}</h4>
                <span class="text-xs text-gray-400 uppercase tracking-widest font-semibold">{user?.skillLevel} student</span>
              </div>
            </div>
            
            <div class="space-y-2 text-xs text-gray-300 border-t border-darkBorder pt-3">
              <div class="flex justify-between">
                <span class="text-gray-400">Weekly Commits:</span>
                <span class="font-semibold text-white">{user?.availability} hours</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Schedule:</span>
                <span class="font-semibold text-white capitalize">{user?.preferredSchedule}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">LeetCode Profile:</span>
                <span class="font-semibold text-violet-400">{user?.leetcodeUsername || 'Not set'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Codeforces:</span>
                <span class="font-semibold text-fuchsia-400">{user?.codeforcesUsername || 'Not set'}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-darkBorder/40">
            <h5 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">My Stacks</h5>
            <div class="flex flex-wrap gap-1">
              {user?.techStack?.map((stack, idx) => (
                <span key={idx} class="text-[9px] font-semibold bg-violet-950/40 text-violet-300 border border-violet-800/40 px-2 py-0.5 rounded">
                  {stack}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* MyStudyMatch Recommender Deck */}
        <div class="md:col-span-2 bg-darkCard border border-darkBorder rounded-2xl p-6 shadow-xl relative min-h-[350px] flex flex-col justify-between">
          <div class="absolute w-32 h-32 bg-fuchsia-600/10 rounded-full blur-2xl -bottom-10 -right-10"></div>
          
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-white text-lg flex items-center gap-2">
              <Zap class="w-4 h-4 text-violet-400" />
              <span>MyStudyMatch</span>
            </h3>
            <span class="text-[10px] font-semibold bg-violet-600/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/20 flex items-center gap-1">
              <Sparkles class="w-3 h-3" /> ML Engine Active
            </span>
          </div>

          {loadingMatches ? (
            <div class="flex-1 flex flex-col items-center justify-center">
              <span class="animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent"></span>
              <span class="text-xs text-gray-400 mt-2">Computing compatibility scores...</span>
            </div>
          ) : activeMatch ? (
            <div class="flex-1 flex flex-col justify-between">
              {/* Active Student Card */}
              <div class="bg-darkBg/60 border border-darkBorder/50 rounded-xl p-5 relative overflow-hidden transition-all duration-300 transform scale-100 hover:scale-[1.01]">
                {/* Compatibility Badge */}
                <div class="absolute top-4 right-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-sm px-3 py-1 rounded-full shadow-lg">
                  {activeMatch.compatibility}% Match
                </div>

                <div class="mb-3">
                  <h4 class="text-lg font-bold text-white">{activeMatch.user.name}</h4>
                  <p class="text-xs text-violet-400 font-semibold uppercase tracking-wider">{activeMatch.user.skillLevel} Student</p>
                </div>

                <div class="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div>
                    <span class="text-gray-500 block mb-0.5">Commitment</span>
                    <span class="text-gray-300 font-semibold">{activeMatch.user.availability} hours/week</span>
                  </div>
                  <div>
                    <span class="text-gray-500 block mb-0.5">Prefers Timing</span>
                    <span class="text-gray-300 font-semibold capitalize">{activeMatch.user.preferredSchedule}</span>
                  </div>
                </div>

                <div class="mb-4">
                  <span class="text-gray-500 block text-xs mb-1">Target Stacks</span>
                  <div class="flex flex-wrap gap-1">
                    {activeMatch.user.techStack?.map((t, i) => (
                      <span key={i} class="text-[10px] bg-darkBorder/60 border border-darkBorder px-2 py-0.5 rounded text-gray-300">{t}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <span class="text-gray-500 block text-xs mb-1">Learning Goals</span>
                  <ul class="text-[11px] list-disc list-inside text-gray-300 space-y-0.5">
                    {activeMatch.user.learningGoals?.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {actionMessage && (
                <div class="text-center text-xs text-violet-400 font-semibold my-2">{actionMessage}</div>
              )}

              {/* Action Buttons */}
              <div class="flex gap-4 justify-center mt-4">
                <button
                  onClick={handleSkip}
                  class="flex items-center gap-2 px-6 py-2.5 bg-darkBg border border-darkBorder hover:border-gray-600 rounded-xl text-gray-400 hover:text-white transition-all text-xs font-semibold"
                >
                  <X class="w-4 h-4" /> Pass Match
                </button>
                <button
                  onClick={() => handleConnect(activeMatch.user._id)}
                  class="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl shadow-lg shadow-violet-600/20 text-xs font-bold transition-all"
                >
                  <Send class="w-4 h-4" /> Request Connect
                </button>
              </div>
            </div>
          ) : (
            <div class="flex-1 flex flex-col items-center justify-center text-center p-8 bg-darkBg/30 rounded-xl border border-dashed border-darkBorder">
              <span class="text-3xl mb-2">🏁</span>
              <h4 class="font-bold text-white text-sm">All matched profiles reviewed!</h4>
              <p class="text-xs text-gray-500 mt-1 max-w-[280px]">Check back later for new student signups or run clustering in the Admin dashboard.</p>
              <button onClick={fetchData} class="mt-4 px-4 py-1.5 bg-darkBg border border-darkBorder rounded-lg text-[10px] text-gray-400 hover:text-white">
                Refresh Deck
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Underneath: Requests & Peers List */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Incoming Study Requests */}
        <div class="bg-darkCard border border-darkBorder rounded-2xl p-6 shadow-xl min-h-[250px]">
          <h3 class="font-bold text-white text-base flex items-center gap-2 mb-4">
            <UserCheck class="w-4 h-4 text-violet-400" />
            <span>Connection Requests Received</span>
            {incomingRequests.length > 0 && (
              <span class="bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{incomingRequests.length}</span>
            )}
          </h3>

          <div class="space-y-3">
            {incomingRequests.length > 0 ? (
              incomingRequests.map((req) => (
                <div key={req._id} class="flex items-center justify-between p-3 bg-darkBg/60 border border-darkBorder/40 rounded-xl">
                  <div>
                    <h5 class="font-bold text-white text-xs">{req.sender?.name}</h5>
                    <p class="text-[10px] text-gray-400 capitalize">{req.sender?.skillLevel} student • {req.sender?.techStack?.slice(0,2).join(', ')}</p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      onClick={() => handleRequestResponse(req._id, 'declined')}
                      class="p-1.5 bg-darkCard border border-darkBorder text-gray-400 hover:text-red-400 rounded-lg hover:border-red-400/30 transition-all"
                      title="Decline"
                    >
                      <X class="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRequestResponse(req._id, 'accepted')}
                      class="p-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-all shadow-md"
                      title="Accept"
                    >
                      <Check class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p class="text-xs text-gray-500 text-center py-8">No pending incoming requests.</p>
            )}
          </div>
        </div>

        {/* Connected Contacts */}
        <div class="bg-darkCard border border-darkBorder rounded-2xl p-6 shadow-xl min-h-[250px]">
          <h3 class="font-bold text-white text-base flex items-center gap-2 mb-4">
            <Users class="w-4 h-4 text-violet-400" />
            <span>Connected Study Partners ({connectedPeers.length})</span>
          </h3>

          <div class="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {connectedPeers.length > 0 ? (
              connectedPeers.map((peer, idx) => (
                <div key={idx} class="flex items-center justify-between p-3 bg-darkBg/60 border border-darkBorder/40 rounded-xl">
                  <div>
                    <h5 class="font-bold text-white text-xs">{peer.name}</h5>
                    <p class="text-[10px] text-violet-400 font-medium">{peer.email}</p>
                  </div>
                  <span class="text-[9px] bg-emerald-950/40 text-emerald-300 border border-emerald-900/40 px-2 py-0.5 rounded">
                    Connected
                  </span>
                </div>
              ))
            ) : (
              <div class="text-center py-8">
                <p class="text-xs text-gray-500">No study partners connected yet.</p>
                <p class="text-[10px] text-gray-600 mt-1">Accept incoming requests or send out invitations using MyStudyMatch.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
