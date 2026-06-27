import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, API_URL } from '../context/AuthContext';
import axios from 'axios';
import { MessageSquare, ListTodo, Users, Trophy, Play, CheckCircle2, ChevronRight, ArrowRight, ShieldAlert, Send } from 'lucide-react';

const GroupHub = () => {
  const { user } = useContext(AuthContext);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allGroups, setAllGroups] = useState([]);
  
  // Creation States
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('Algorithms & DSA');
  const [description, setDescription] = useState('');

  // Group Features States
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  
  // Challenges States
  const [incomingChallenges, setIncomingChallenges] = useState([]);
  const [outgoingChallenges, setOutgoingChallenges] = useState([]);
  const [targetGroupId, setTargetGroupId] = useState('');
  const [challengeType, setChallengeType] = useState('Coding Sprint');

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/groups/my-group`);
      setGroup(res.data);

      if (!res.data) {
        // Fetch all groups for join list
        const groupsRes = await axios.get(`${API_URL}/groups`);
        setAllGroups(groupsRes.data);
      } else {
        // Fetch challenges involving current group
        const challengeRes = await axios.get(`${API_URL}/challenges/my-challenges`);
        setIncomingChallenges(challengeRes.data.incoming || []);
        setOutgoingChallenges(challengeRes.data.outgoing || []);

        // Load all groups excluding current for challenging dropdown
        const allGroupsRes = await axios.get(`${API_URL}/groups`);
        setAllGroups(allGroupsRes.data.filter(g => g._id !== res.data._id));
      }
    } catch (err) {
      console.error('Error fetching group details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, []);

  // Creation/Join Group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/groups`, { name, description, topic });
      fetchGroupDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating group');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(`${API_URL}/groups/${groupId}/join`);
      fetchGroupDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error joining group');
    }
  };

  // Kanban Tasks Action
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      const res = await axios.post(`${API_URL}/groups/tasks`, { title: newTaskTitle });
      setGroup({ ...group, tasks: res.data.tasks });
      setNewTaskTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await axios.put(`${API_URL}/groups/tasks/${taskId}`, { status: newStatus });
      setGroup({ ...group, tasks: res.data.tasks, points: res.data.points });
    } catch (err) {
      console.error(err);
    }
  };

  // Chat Actions
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage) return;
    try {
      const res = await axios.post(`${API_URL}/groups/messages`, { text: chatMessage });
      setGroup({ ...group, messages: res.data.chat });
      setChatMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  // Challenges Actions
  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    if (!targetGroupId) return;
    try {
      await axios.post(`${API_URL}/challenges`, { targetGroupId, challengeType, daysDuration: 3 });
      alert('Challenge sent!');
      fetchGroupDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending challenge');
    }
  };

  const handleChallengeResponse = async (challengeId, status) => {
    try {
      await axios.put(`${API_URL}/challenges/${challengeId}`, { status });
      fetchGroupDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteChallenge = async (challengeId, winnerId) => {
    try {
      await axios.post(`${API_URL}/challenges/${challengeId}/complete`, { winnerGroupId: winnerId });
      alert('Challenge completed!');
      fetchGroupDetails();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center min-h-[400px]">
        <span class="animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent"></span>
      </div>
    );
  }

  // Not in a Group view
  if (!group) {
    return (
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto py-8">
        
        {/* Create Manual Group Card */}
        <div class="bg-darkCard border border-darkBorder rounded-2xl p-6 shadow-xl">
          <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Trophy class="w-5 h-5 text-violet-400" />
            <span>Create a Study Group</span>
          </h3>
          <p class="text-xs text-gray-400 mb-6">Start a new group manually. Other matched students can discover and join you.</p>

          <form onSubmit={handleCreateGroup} class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Group Name</label>
              <input
                type="text"
                placeholder="LeetCode Masters"
                value={name}
                onChange={(e) => setName(e.target.value)}
                class="w-full bg-darkBg border border-darkBorder rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Topic / Subject Focus</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                class="w-full bg-darkBg border border-darkBorder rounded-lg py-2 px-4 text-sm text-gray-300 focus:outline-none focus:border-violet-500"
              >
                <option value="Algorithms & DSA">Algorithms & DSA</option>
                <option value="Web Development">Web Development</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="System Design">System Design</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
              <textarea
                placeholder="Detail the goals of the group..."
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                class="w-full bg-darkBg border border-darkBorder rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:border-violet-500"
              ></textarea>
            </div>

            <button
              type="submit"
              class="w-full bg-violet-600 hover:bg-violet-500 text-xs font-bold py-2.5 rounded-lg text-white"
            >
              Launch Group
            </button>
          </form>
        </div>

        {/* Join Available Groups List */}
        <div class="bg-darkCard border border-darkBorder rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Users class="w-5 h-5 text-violet-400" />
              <span>Discover Study Groups</span>
            </h3>
            <p class="text-xs text-gray-400 mb-6">Or join an active peer study group in the system.</p>

            <div class="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {allGroups.length > 0 ? (
                allGroups.map((g) => (
                  <div key={g._id} class="p-4 bg-darkBg/60 border border-darkBorder/40 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 class="font-bold text-white text-sm">{g.name}</h4>
                      <p class="text-[10px] text-violet-400 font-semibold uppercase">{g.topic}</p>
                      <p class="text-[11px] text-gray-400 mt-1">{g.description || 'No description provided.'}</p>
                      <span class="text-[10px] text-gray-500 block mt-2">{g.members?.length} Members</span>
                    </div>
                    <button
                      onClick={() => handleJoinGroup(g._id)}
                      class="px-3 py-1.5 bg-darkCard border border-darkBorder hover:border-violet-500 text-xs font-semibold text-gray-300 hover:text-white rounded-lg transition-all"
                    >
                      Join
                    </button>
                  </div>
                ))
              ) : (
                <div class="text-center py-10 bg-darkBg/30 rounded-xl border border-dashed border-darkBorder">
                  <p class="text-xs text-gray-500">No public groups found.</p>
                  <p class="text-[10px] text-gray-600 mt-1">Create one above to get started or trigger clustering in Admin.</p>
                </div>
              )}
            </div>
          </div>

          <div class="mt-6 bg-violet-950/20 border border-violet-800/20 p-4 rounded-xl text-center">
            <span class="text-xs text-violet-300 font-bold block mb-1">🤖 ML Auto-Grouping Note</span>
            <p class="text-[10px] text-gray-400">If you are awaiting K-Means clustering, the system will automatically rebuild groups and place you in a group when the next cycle runs.</p>
          </div>
        </div>
      </div>
    );
  }

  // Active Group workspace view
  return (
    <div class="space-y-6">
      
      {/* Group Header Card */}
      <div class="bg-darkCard border border-darkBorder rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div class="absolute w-32 h-32 bg-violet-600/5 rounded-full blur-xl -top-10 -left-10"></div>
        <div>
          <span class="text-[10px] font-bold text-violet-400 uppercase tracking-widest bg-violet-950/40 border border-violet-800/40 px-2 py-0.5 rounded">
            {group.topic}
          </span>
          <h2 class="text-2xl font-black text-white mt-1">{group.name}</h2>
          <p class="text-xs text-gray-400 mt-1 max-w-lg">{group.description}</p>
        </div>

        <div class="flex items-center gap-4 bg-darkBg/60 border border-darkBorder/40 p-4 rounded-xl shrink-0">
          <div class="text-center">
            <span class="text-xs text-gray-400 block uppercase tracking-wider">Group Score</span>
            <span class="text-xl font-black text-violet-400">{group.points} pts</span>
          </div>
          <div class="h-8 w-[1px] bg-darkBorder"></div>
          <div>
            <span class="text-xs text-gray-400 block uppercase tracking-wider mb-1">Members ({group.members?.length})</span>
            <div class="flex -space-x-2">
              {group.members?.map((member, idx) => (
                <div
                  key={idx}
                  title={`${member.name} (${member.email}) - Click to see stats`}
                  class="w-7 h-7 rounded-full bg-violet-600 border border-darkBg flex items-center justify-center text-[10px] font-bold text-white cursor-help"
                >
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat & Kanban Board */}
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Chat Component (Left 2 cols) */}
        <div class="lg:col-span-2 bg-darkCard border border-darkBorder rounded-2xl p-5 shadow-xl flex flex-col h-[400px] justify-between">
          <div>
            <h3 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <MessageSquare class="w-4 h-4 text-violet-400" />
              <span>Group Discussion Board</span>
            </h3>
          </div>

          {/* Chat Messages Log */}
          <div class="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
            {group.messages && group.messages.length > 0 ? (
              group.messages.map((msg, idx) => (
                <div key={idx} class="text-xs bg-darkBg/60 border border-darkBorder/30 p-2.5 rounded-lg">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-violet-400">{msg.senderName}</span>
                    <span class="text-[9px] text-gray-500">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p class="text-gray-300 leading-relaxed">{msg.text}</p>
                </div>
              ))
            ) : (
              <p class="text-xs text-gray-500 text-center py-12">No messages yet. Send a hello to coordinate study slots!</p>
            )}
          </div>

          <form onSubmit={handleSendChatMessage} class="flex gap-2 pt-3 border-t border-darkBorder/40">
            <input
              type="text"
              placeholder="Type message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              class="flex-1 bg-darkBg border border-darkBorder rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              class="p-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-white transition-all shadow"
            >
              <Send class="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Kanban Task Board (Right 3 cols) */}
        <div class="lg:col-span-3 bg-darkCard border border-darkBorder rounded-2xl p-5 shadow-xl flex flex-col h-[400px] justify-between">
          
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <ListTodo class="w-4 h-4 text-violet-400" />
              <span>Sprint Task Board (+15 points per Done)</span>
            </h3>
            
            <form onSubmit={handleAddTask} class="flex gap-2">
              <input
                type="text"
                placeholder="New Task Title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                class="bg-darkBg border border-darkBorder rounded-lg py-1 px-3 text-[10px] text-white focus:outline-none focus:border-violet-500"
              />
              <button type="submit" class="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 rounded-lg text-[10px] font-bold text-white">
                Add
              </button>
            </form>
          </div>

          {/* Kanban Columns */}
          <div class="grid grid-cols-3 gap-3 flex-1 overflow-hidden pt-2">
            
            {/* Columns Helper */}
            {['todo', 'in-progress', 'done'].map((columnKey) => {
              const columnTasks = group.tasks?.filter(t => t.status === columnKey) || [];
              const columnLabel = columnKey === 'todo' ? 'To Do' : columnKey === 'in-progress' ? 'In Progress' : 'Completed';
              const columnColor = columnKey === 'todo' ? 'bg-gray-800/40 text-gray-400' : columnKey === 'in-progress' ? 'bg-blue-950/20 text-blue-400 border border-blue-900/20' : 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/20';

              return (
                <div key={columnKey} class="bg-darkBg/40 border border-darkBorder/40 rounded-xl p-2.5 flex flex-col h-full overflow-hidden">
                  <div class="flex justify-between items-center mb-2 px-1">
                    <span class={`text-[10px] font-bold px-2 py-0.5 rounded ${columnColor}`}>
                      {columnLabel}
                    </span>
                    <span class="text-[10px] text-gray-500 font-bold">{columnTasks.length}</span>
                  </div>

                  <div class="flex-1 overflow-y-auto space-y-2 pr-0.5">
                    {columnTasks.map((task) => (
                      <div key={task._id} class="bg-darkCard border border-darkBorder/80 p-2 rounded-lg relative group">
                        <h4 class="text-[11px] font-bold text-white leading-tight">{task.title}</h4>
                        {task.description && <p class="text-[9px] text-gray-400 mt-1">{task.description}</p>}
                        
                        {/* Task Progression Controls */}
                        <div class="flex justify-end gap-1 mt-2 pt-1 border-t border-darkBorder/30">
                          {columnKey === 'todo' && (
                            <button
                              onClick={() => handleUpdateTaskStatus(task._id, 'in-progress')}
                              class="text-[8px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                            >
                              In Progress <ChevronRight class="w-2.5 h-2.5" />
                            </button>
                          )}
                          {columnKey === 'in-progress' && (
                            <button
                              onClick={() => handleUpdateTaskStatus(task._id, 'done')}
                              class="text-[8px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                            >
                              Complete <CheckCircle2 class="w-2.5 h-2.5" />
                            </button>
                          )}
                          {columnKey === 'done' && (
                            <span class="text-[8px] text-emerald-400 font-bold flex items-center gap-0.5">
                              ✓ Done
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Challenges & Sprints Panel */}
      <div class="bg-darkCard border border-darkBorder rounded-2xl p-6 shadow-xl">
        <h3 class="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Trophy class="w-4 h-4 text-fuchsia-400" />
          <span>Group vs Group Sprints & Challenges</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Challenge Issuing Form */}
          <div class="bg-darkBg/60 border border-darkBorder/40 p-4 rounded-xl">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-3">Issue a Sprint Challenge</h4>
            <form onSubmit={handleCreateChallenge} class="space-y-3">
              <div>
                <label class="block text-[10px] text-gray-400 uppercase font-semibold mb-1">Target Study Group</label>
                <select
                  value={targetGroupId}
                  onChange={(e) => setTargetGroupId(e.target.value)}
                  class="w-full bg-darkCard border border-darkBorder rounded-lg py-1.5 px-3 text-[10px] text-gray-300 focus:outline-none focus:border-violet-500"
                >
                  <option value="">Select Target Group...</option>
                  {allGroups.map((g) => (
                    <option key={g._id} value={g._id}>{g.name} ({g.topic})</option>
                  ))}
                </select>
              </div>

              <div>
                <label class="block text-[10px] text-gray-400 uppercase font-semibold mb-1">Challenge Type</label>
                <select
                  value={challengeType}
                  onChange={(e) => setChallengeType(e.target.value)}
                  class="w-full bg-darkCard border border-darkBorder rounded-lg py-1.5 px-3 text-[10px] text-gray-300 focus:outline-none focus:border-violet-500"
                >
                  <option value="Coding Sprint">Coding Sprint (3 Days)</option>
                  <option value="Focus Hours">Focus Hours (Study block)</option>
                  <option value="Leetcode Run">Leetcode Run (Problem count)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!targetGroupId}
                class="w-full bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-[10px] font-bold py-2 rounded text-white transition-all shadow"
              >
                Send Challenge
              </button>
            </form>
          </div>

          {/* Incoming Challenges List */}
          <div class="bg-darkBg/60 border border-darkBorder/40 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-3">Incoming Sprints</h4>
              <div class="space-y-2 max-h-[140px] overflow-y-auto">
                {incomingChallenges.length > 0 ? (
                  incomingChallenges.map((c) => (
                    <div key={c._id} class="p-2.5 bg-darkCard border border-darkBorder/60 rounded-lg flex justify-between items-center text-[10px]">
                      <div>
                        <span class="font-bold text-white">{c.challengerGroup?.name}</span>
                        <span class="text-gray-400 block mt-0.5">{c.challengeType} • Status: <span class="capitalize text-fuchsia-400">{c.status}</span></span>
                      </div>
                      
                      {c.status === 'pending' && (
                        <div class="flex gap-1 shrink-0">
                          <button
                            onClick={() => handleChallengeResponse(c._id, 'declined')}
                            class="px-1.5 py-0.5 bg-red-950/40 text-red-400 rounded hover:bg-red-950 transition-all border border-red-900/30"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleChallengeResponse(c._id, 'accepted')}
                            class="px-1.5 py-0.5 bg-violet-600 text-white rounded hover:bg-violet-500 transition-all shadow"
                          >
                            Accept
                          </button>
                        </div>
                      )}

                      {c.status === 'accepted' && (
                        <button
                          onClick={() => handleCompleteChallenge(c._id, group._id)}
                          class="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-900/30 font-bold shrink-0"
                        >
                          Complete (Win)
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p class="text-[10px] text-gray-500 py-6 text-center">No incoming challenges.</p>
                )}
              </div>
            </div>
          </div>

          {/* Outgoing Challenges List */}
          <div class="bg-darkBg/60 border border-darkBorder/40 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-3">Outgoing Sprints Issued</h4>
              <div class="space-y-2 max-h-[140px] overflow-y-auto">
                {outgoingChallenges.length > 0 ? (
                  outgoingChallenges.map((c) => (
                    <div key={c._id} class="p-2.5 bg-darkCard border border-darkBorder/60 rounded-lg flex justify-between items-center text-[10px]">
                      <div>
                        <span class="font-bold text-white">{c.targetGroup?.name}</span>
                        <span class="text-gray-400 block mt-0.5">{c.challengeType} • <span class="capitalize text-gray-300">{c.status}</span></span>
                      </div>
                      
                      {c.status === 'accepted' && (
                        <button
                          onClick={() => handleCompleteChallenge(c._id, group._id)}
                          class="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-900/30 font-bold shrink-0"
                        >
                          Mark Completed (Win)
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p class="text-[10px] text-gray-500 py-6 text-center">No outgoing challenges sent.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GroupHub;
