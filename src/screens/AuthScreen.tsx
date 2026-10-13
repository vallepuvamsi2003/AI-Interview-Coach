import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, ArrowRight, KeyRound, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/apiClient';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { login, register, loginAsDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          throw new Error('Please fill in both email and password.');
        }
        await login(email, password);
        onSuccess();
      } else if (mode === 'register') {
        if (!name || !email || !password) {
          throw new Error('Please fill in all required fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await register(name, email, password, confirmPassword);
        onSuccess();
      } else if (mode === 'forgot') {
        if (!email) throw new Error('Please provide your registered email.');
        const res = await api.forgotPassword(email);
        setSuccessMsg(res.message);
        if (res.resetToken) {
          setResetToken(res.resetToken);
          setMode('reset');
        }
      } else if (mode === 'reset') {
        if (!email || !resetToken || !newPassword) {
          throw new Error('Please provide email, reset token, and your new password.');
        }
        const res = await api.resetPassword(email, resetToken, newPassword);
        setSuccessMsg(res.message);
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginAsDemo();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-8 bg-[#F8F9FC]">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#00D4FF] mx-auto flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-300/40 mb-3">
          AI
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {mode === 'login' && 'Welcome Back'}
          {mode === 'register' && 'Create Your Account'}
          {mode === 'forgot' && 'Forgot Password'}
          {mode === 'reset' && 'Set New Password'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {mode === 'login' && 'Master your technical & behavioral interviews'}
          {mode === 'register' && 'Join thousands preparing for high-paying roles'}
          {mode === 'forgot' && 'Enter your email to receive a password reset token'}
          {mode === 'reset' && 'Enter your reset token and new secure password'}
        </p>
      </div>

      {/* Demo Account Quick Access Card */}
      <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-2xl border border-indigo-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#6C63FF] text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Quick Test Account</p>
            <p className="text-[10px] text-slate-500">Instant access with real past history & analytics</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDemoSignIn}
          disabled={isLoading}
          className="px-3 py-1.5 bg-[#6C63FF] hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading ? '...' : '1-Click Demo'}
        </button>
      </div>

      {/* Notifications / Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-slate-800 shadow-sm"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-slate-800 shadow-sm"
            />
          </div>
        </div>

        {(mode === 'login' || mode === 'register') && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-[#6C63FF] hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-slate-800 shadow-sm"
              />
            </div>
          </div>
        )}

        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-slate-800 shadow-sm"
              />
            </div>
          </div>
        )}

        {mode === 'reset' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reset Token</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="rst_xxxxx"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-slate-800 shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-slate-800 shadow-sm"
                />
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 bg-[#6C63FF] hover:bg-indigo-600 active:scale-[0.98] text-white py-3 rounded-2xl font-semibold text-sm shadow-md shadow-indigo-300/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Token'}
                {mode === 'reset' && 'Reset Password'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch mode links */}
      <div className="mt-6 text-center text-xs text-slate-500">
        {mode === 'login' && (
          <p>
            Don't have an account?{' '}
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className="text-[#6C63FF] font-semibold hover:underline"
            >
              Sign Up
            </button>
          </p>
        )}
        {mode === 'register' && (
          <p>
            Already have an account?{' '}
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className="text-[#6C63FF] font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        )}
        {(mode === 'forgot' || mode === 'reset') && (
          <p>
            Remember your credentials?{' '}
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className="text-[#6C63FF] font-semibold hover:underline"
            >
              Back to Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
