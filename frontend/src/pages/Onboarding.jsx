import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Award, Clock, Code2, Cpu, Sparkles } from 'lucide-react';

const Onboarding = () => {
  const { updateProfile } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  
  // Form State
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [codeforcesUsername, setCodeforcesUsername] = useState('');
  const [techStack, setTechStack] = useState([]);
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [availability, setAvailability] = useState(10);
  const [preferredSchedule, setPreferredSchedule] = useState('evening');
  const [learningGoals, setLearningGoals] = useState([]);
  
  const [error, setError] = useState('');

  const techOptions = ['React', 'Node.js', 'Python', 'AI/ML', 'C++', 'Java', 'Data Structures', 'System Design'];
  const goalOptions = ['Prepare for FAANG', 'Build Side Projects', 'Master LeetCode', 'Learn AI/ML Foundations', 'Contribute to Open Source'];

  const handleTechToggle = (tech) => {
    if (techStack.includes(tech)) {
      setTechStack(techStack.filter(item => item !== tech));
    } else {
      setTechStack([...techStack, tech]);
    }
  };

  const handleGoalToggle = (goal) => {
    if (learningGoals.includes(goal)) {
      setLearningGoals(learningGoals.filter(item => item !== goal));
    } else {
      setLearningGoals([...learningGoals, goal]);
    }
  };

  const handleNext = () => {
    if (step === 1 && techStack.length === 0) {
      setError('Please select at least one technology stack interest.');
      return;
    }
    if (step === 3 && learningGoals.length === 0) {
      setError('Please select at least one learning goal.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handlePrev = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (learningGoals.length === 0) {
      setError('Please select at least one learning goal.');
      return;
    }

    try {
      await updateProfile({
        leetcodeUsername,
        codeforcesUsername,
        techStack,
        skillLevel,
        availability: Number(availability),
        preferredSchedule,
        learningGoals
      });
    } catch (err) {
      setError(err.message || 'Failed to complete profile registration.');
    }
  };

  return (
    <div class="min-h-screen bg-darkBg py-12 px-4 flex flex-col justify-center items-center relative overflow-hidden">
      <div class="absolute w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px] top-1/4 left-1/4"></div>
      
      <div class="w-full max-w-xl bg-darkCard border border-darkBorder rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Progress Bar */}
        <div class="w-full flex items-center justify-between mb-8">
          {[1, 2, 3].map((num) => (
            <div key={num} class="flex items-center flex-1 last:flex-none">
              <div class={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step >= num 
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg' 
                  : 'bg-darkBg border border-darkBorder text-gray-500'
              }`}>
                {num}
              </div>
              {num < 3 && (
                <div class={`h-[2px] flex-1 mx-2 transition-all duration-500 ${
                  step > num ? 'bg-violet-600' : 'bg-darkBorder'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Coding Profile & Tech Stack */}
        {step === 1 && (
          <div>
            <div class="flex items-center gap-2 mb-4">
              <Code2 class="w-5 h-5 text-violet-400" />
              <h3 class="text-xl font-bold text-white">Coding Profiles & Tech Stack</h3>
            </div>
            <p class="text-sm text-gray-400 mb-6">Fill in your competitive coding handles and select what stacks interest you.</p>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">LeetCode Username</label>
                <input
                  type="text"
                  placeholder="leetcode_username"
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  class="w-full bg-darkBg border border-darkBorder rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div class="mb-6">
                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Codeforces Username</label>
                <input
                  type="text"
                  placeholder="codeforces_username"
                  value={codeforcesUsername}
                  onChange={(e) => setCodeforcesUsername(e.target.value)}
                  class="w-full bg-darkBg border border-darkBorder rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Target Tech Stack (Select all that apply)</label>
                <div class="grid grid-cols-2 gap-2">
                  {techOptions.map((tech) => (
                    <button
                      type="button"
                      key={tech}
                      onClick={() => handleTechToggle(tech)}
                      class={`py-2 px-3 text-sm rounded-lg border text-left transition-all ${
                        techStack.includes(tech)
                          ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                          : 'bg-darkBg border-darkBorder text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Time & Availability */}
        {step === 2 && (
          <div>
            <div class="flex items-center gap-2 mb-4">
              <Clock class="w-5 h-5 text-violet-400" />
              <h3 class="text-xl font-bold text-white">Availability & Timing</h3>
            </div>
            <p class="text-sm text-gray-400 mb-6">Let us know how many hours you can commit and your daily preferred timings.</p>

            <div class="space-y-6">
              <div>
                <div class="flex justify-between items-center mb-2">
                  <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Weekly Commitment</label>
                  <span class="text-sm font-bold text-violet-400">{availability} hours/week</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  class="w-full h-1 bg-darkBg rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div class="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>2 hours (Casual)</span>
                  <span>40 hours (Heavy Prep)</span>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Preferred Study Schedule</label>
                <div class="grid grid-cols-2 gap-3">
                  {[
                    { val: 'morning', label: '🌅 Morning (8 AM - 12 PM)' },
                    { val: 'afternoon', label: '☀️ Afternoon (12 PM - 5 PM)' },
                    { val: 'evening', label: '🌇 Evening (5 PM - 9 PM)' },
                    { val: 'night', label: '🌙 Night (9 PM - 2 AM)' }
                  ].map((sched) => (
                    <button
                      type="button"
                      key={sched.val}
                      onClick={() => setPreferredSchedule(sched.val)}
                      class={`py-3 px-4 text-xs rounded-xl border text-left transition-all ${
                        preferredSchedule === sched.val
                          ? 'bg-violet-600/20 border-violet-500 text-violet-300 shadow-md'
                          : 'bg-darkBg border-darkBorder text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      {sched.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Goals & Skill Level */}
        {step === 3 && (
          <div>
            <div class="flex items-center gap-2 mb-4">
              <Award class="w-5 h-5 text-violet-400" />
              <h3 class="text-xl font-bold text-white">Goals & Experience</h3>
            </div>
            <p class="text-sm text-gray-400 mb-6">Select your current skill experience and your target study goals.</p>

            <div class="space-y-6">
              <div>
                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Current Coding Experience</label>
                <div class="grid grid-cols-3 gap-2">
                  {[
                    { val: 'beginner', label: 'Beginner', desc: 'Starting out' },
                    { val: 'intermediate', label: 'Intermediate', desc: 'Solved 100+ questions' },
                    { val: 'advanced', label: 'Advanced', desc: 'Competitive coder' }
                  ].map((level) => (
                    <button
                      type="button"
                      key={level.val}
                      onClick={() => setSkillLevel(level.val)}
                      class={`py-3 px-2 text-center rounded-xl border transition-all ${
                        skillLevel === level.val
                          ? 'bg-violet-600/20 border-violet-500 text-violet-300 font-bold'
                          : 'bg-darkBg border-darkBorder text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <div class="text-sm">{level.label}</div>
                      <div class="text-[9px] text-gray-500 mt-1 font-normal">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Primary Learning Goals</label>
                <div class="space-y-2">
                  {goalOptions.map((goal) => (
                    <button
                      type="button"
                      key={goal}
                      onClick={() => handleGoalToggle(goal)}
                      class={`w-full py-2.5 px-4 text-xs rounded-lg border text-left transition-all flex items-center justify-between ${
                        learningGoals.includes(goal)
                          ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                          : 'bg-darkBg border-darkBorder text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <span>{goal}</span>
                      {learningGoals.includes(goal) && <Sparkles class="w-3.5 h-3.5 text-violet-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons Panel */}
        <div class="flex justify-between mt-8 pt-4 border-t border-darkBorder">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              class="px-5 py-2.5 rounded-lg border border-darkBorder text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-all"
            >
              Previous
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              class="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white rounded-lg shadow-lg shadow-violet-600/20 transition-all"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              class="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-bold text-white rounded-lg shadow-lg shadow-violet-600/20 transition-all"
            >
              Submit & Build Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
