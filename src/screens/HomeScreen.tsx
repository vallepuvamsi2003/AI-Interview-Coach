import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/apiClient';
import { AnalyticsSummary, Interview } from '../types';
import {
  Play,
  Award,
  TrendingUp,
  Target,
  ArrowRight,
  Flame,
  CheckCircle,
  Briefcase,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface HomeScreenProps {
  onStartInterview: (preset?: { role?: string; type?: string }) => void;
  onOpenReport: (interviewId: number) => void;
  onOpenPractice: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartInterview,
  onOpenReport,
  onOpenPractice,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    try {
      const data = await api.getAnalyticsSummary();
      if (data.success) {
        setStats(data);
      }
    } catch (e) {
      console.warn('Error loading dashboard analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const categories = [
    { name: 'Java Developer', type: 'Technical', icon: '☕', color: 'from-amber-500 to-orange-500' },
    { name: 'React Native', type: 'Technical', icon: '📱', color: 'from-indigo-500 to-purple-600' },
    { name: 'Full Stack', type: 'Technical', icon: '⚡', color: 'from-blue-500 to-cyan-500' },
    { name: 'Python Developer', type: 'Technical', icon: '🐍', color: 'from-emerald-500 to-teal-600' },
    { name: 'Behavioral & STAR', type: 'Behavioral', icon: '🎯', color: 'from-rose-500 to-pink-600' },
    { name: 'HR & Culture', type: 'HR', icon: '🤝', color: 'from-violet-500 to-indigo-600' },
  ];

  return (
    <div className="flex-1 px-4 py-5 space-y-6 pb-20">
      {/* Personalized Greeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#6C63FF] uppercase tracking-wider">
            {getGreeting()}
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {user?.name || 'Interview Candidate'} 👋
          </h1>
          <p className="text-xs text-slate-500">Ready for your next mock session?</p>
        </div>

        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#00D4FF] p-0.5 shadow-md shadow-indigo-200">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-bold text-[#6C63FF] text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>

      {/* Main Call-to-Action Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6C63FF] to-[#4F46E5] text-white p-5 shadow-xl shadow-indigo-300/30">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-semibold tracking-wide text-white mb-3">
            <Sparkles className="w-3 h-3 text-[#00D4FF]" />
            <span>AI Voice & Structured Rubrics</span>
          </div>
          <h2 className="text-lg font-bold leading-tight max-w-[240px] mb-1">
            Simulate Your Dream Interview Today
          </h2>
          <p className="text-xs text-indigo-100 max-w-[240px] mb-4">
            Custom technical & HR rounds with live speech recognition & multi-criteria scoring.
          </p>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onStartInterview()}
              className="bg-white text-[#6C63FF] hover:bg-slate-50 active:scale-95 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start New Interview</span>
            </button>
            <button
              onClick={onOpenPractice}
              className="bg-white/20 hover:bg-white/30 text-white active:scale-95 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer"
            >
              Resume Practice
            </button>
          </div>
        </div>
      </div>

      {/* Live Backend Statistics */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Performance Overview
          </h2>
          <span className="text-[11px] text-[#6C63FF] font-semibold">Live Real-time</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Average Score Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#6C63FF] flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase">Avg Score</p>
              <p className="text-lg font-extrabold text-slate-800">
                {stats?.averageScore ? `${stats.averageScore}%` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Total Interviews Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00D4FF] flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase">Completed</p>
              <p className="text-lg font-extrabold text-slate-800">
                {stats?.totalInterviews ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Skill Highlights */}
        {stats && (
          <div className="mt-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Strongest Skill:
              </span>
              <span className="font-bold text-slate-800 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-[11px]">
                {stats.strongestSkill || 'Core Algorithms'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                Needs Focus:
              </span>
              <span className="font-bold text-slate-800 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg text-[11px]">
                {stats.weakTopic || 'Multithreading & Concurrency'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Categories */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Quick Categories
          </h2>
          <span className="text-[11px] text-slate-400">Select to drill</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => onStartInterview({ role: cat.name.replace(' & STAR', '').replace(' & Culture', ''), type: cat.type })}
              className="bg-white hover:bg-slate-50 active:scale-95 p-3 rounded-2xl border border-slate-100 shadow-sm text-left transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <span className="text-xl">{cat.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{cat.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">{cat.type}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Recent Practice Sessions
          </h2>
        </div>

        <div className="space-y-2.5">
          {stats?.recentInterviews && stats.recentInterviews.length > 0 ? (
            stats.recentInterviews.slice(0, 3).map((session) => (
              <div
                key={session.id}
                onClick={() => onOpenReport(session.id)}
                className="bg-white hover:border-indigo-200 p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6C63FF] flex items-center justify-center font-bold text-xs">
                    {session.mode === 'Voice' ? '🎙️' : '✍️'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{session.job_role}</h3>
                    <p className="text-[10px] text-slate-400">
                      {session.interview_type} • {session.difficulty} • {session.total_questions} Questions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {session.overall_score !== null ? (
                    <span
                      className={`text-xs font-extrabold px-2 py-1 rounded-lg ${
                        session.overall_score >= 80
                          ? 'bg-emerald-50 text-emerald-600'
                          : session.overall_score >= 65
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {session.overall_score}%
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">
                      In Progress
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-dashed border-slate-200 text-center">
              <p className="text-xs text-slate-400">No mock sessions recorded yet.</p>
              <button
                onClick={() => onStartInterview()}
                className="mt-2 text-xs font-bold text-[#6C63FF] hover:underline"
              >
                Launch your first mock interview →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
