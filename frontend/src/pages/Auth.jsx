import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, Terminal } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, register, error: authError, loading } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password || (!isLogin && !name)) {
      setFormError('Please fill out all fields.');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      // Handled in context
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-darkBg px-4 relative overflow-hidden">
      {/* Decorative gradients */}
      <div class="absolute w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] -top-40 -left-40"></div>
      <div class="absolute w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] -bottom-40 -right-40"></div>

      <div class="w-full max-w-md bg-darkCard border border-darkBorder rounded-2xl p-8 shadow-2xl relative z-10">
        <div class="flex flex-col items-center mb-8">
          <div class="w-12 h-12 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 mb-3">
            <Terminal class="w-6 h-6 text-white" />
          </div>
          <h2 class="text-3xl font-extrabold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            EduSync
          </h2>
          <p class="text-sm text-gray-400 mt-1">Smart study matching powered by ML</p>
        </div>

        {/* Tab Headers */}
        <div class="flex bg-darkBg/50 p-1 rounded-lg border border-darkBorder/40 mb-6">
          <button
            onClick={() => { setIsLogin(true); setFormError(''); }}
            class={`flex-1 py-2 text-center text-sm font-semibold rounded-md transition-all duration-300 ${
              isLogin ? 'bg-violet-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setFormError(''); }}
            class={`flex-1 py-2 text-center text-sm font-semibold rounded-md transition-all duration-300 ${
              !isLogin ? 'bg-violet-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} class="space-y-4">
          {(formError || authError) && (
            <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 shrink-0" />
              <span>{formError || authError}</span>
            </div>
          )}

          {!isLogin && (
            <div>
              <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Name</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <User class="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  class="w-full bg-darkBg border border-darkBorder rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail class="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                class="w-full bg-darkBg border border-darkBorder rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock class="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                class="w-full bg-darkBg border border-darkBorder rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-bold py-3 rounded-lg shadow-lg shadow-violet-600/20 glow-on-hover transition-all duration-300 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
