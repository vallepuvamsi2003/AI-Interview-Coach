import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import { AnalyticsSummary } from '../types';
import {
  BarChart3,
  TrendingUp,
  Award,
  Target,
  AlertCircle,
  Play,
  CheckCircle2,
  BrainCircuit,
  Zap,
} from 'lucide-react';

interface AnalyticsScreenProps {
  onStartDrill: (topic: string, difficulty: string) => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ onStartDrill }) => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trends, setTrends] = useState<Array<{ sessionIndex: number; role: string; date: string; score: number }>>([]);
  const [weakTopics, setWeakTopics] = useState<Array<{ topic: string; role: string; averageScore: number; attempts: number; recommendedDifficulty: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [sumRes, trendRes, weakRes] = await Promise.all([
          api.getAnalyticsSummary(),
          api.getAnalyticsTrends(),
          api.getWeakTopics(),
        ]);

        if (sumRes.success) setSummary(sumRes);
        if (trendRes.success) setTrends(trendRes.trends);
        if (weakRes.success) setWeakTopics(weakRes.weakTopics);
      } catch (err) {
        console.warn('Analytics loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-8 h-8 border-3 border-[#6C63FF] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500">Loading performance analytics...</p>
      </div>
    );
  }

  const hasData = summary && summary.totalInterviews > 0;

  return (
    <div className="flex-1 px-4 py-5 space-y-5 pb-24 overflow-y-auto bg-[#F8F9FC]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Performance Analytics</h1>
        <p className="text-xs text-slate-500">Data-driven insights on your interview readiness</p>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#6C63FF] mx-auto flex items-center justify-center mb-3">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">No Interview Sessions Yet</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
            Complete your first mock interview to unlock score trends, skill radar, and adaptive drills.
          </p>
          <button
            onClick={() => onStartDrill('Core Foundations', 'Medium')}
            className="px-4 py-2.5 bg-[#6C63FF] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-300/40"
          >
            Start Your First Session
          </button>
        </div>
      ) : (
        <>
          {/* High-Level Overview Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Overall Avg Score
              </span>
              <div className="my-2">
                <span className="text-2xl font-black text-slate-900">{summary.averageScore}%</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Across {summary.totalInterviews} sessions
              </span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Strongest Subject
              </span>
              <div className="my-2">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">
                  {summary.strongestSkill}
                </span>
              </div>
              <span className="text-[10px] text-indigo-600 font-semibold">Consistently high signal</span>
            </div>
          </div>

          {/* Score Trend Over Time Interactive Visualization */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Historical Score Progression</h3>
                <p className="text-[10px] text-slate-400">Score per completed mock session</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-[#6C63FF]">
                Live MySQL Data
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-40 flex items-end justify-around gap-2 pt-6 pb-2 border-b border-slate-100">
              {trends.map((t, idx) => {
                const heightPercent = Math.max(15, t.score);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[9px] font-bold text-slate-600 mb-1 opacity-80 group-hover:opacity-100">
                      {t.score}%
                    </span>
                    <div
                      className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-[#6C63FF] to-[#00D4FF] transition-all group-hover:brightness-110 shadow-xs"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[9px] text-slate-400 mt-1 font-medium truncate w-full text-center">
                      #{t.sessionIndex}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 px-1">
              <span>First Session</span>
              <span>Latest Session</span>
            </div>
          </div>

          {/* Adaptive Practice Recommendation Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 p-4 rounded-3xl border border-amber-200/60 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-amber-800">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <h3 className="text-xs font-bold">Adaptive Drill Recommendation</h3>
            </div>
            <p className="text-xs text-slate-600">
              Our backend identified that{' '}
              <strong className="text-slate-900 font-bold">{summary.weakTopic}</strong> has the lowest
              historical accuracy. Practice a focused 3-question drill with progressive difficulty.
            </p>
            <button
              onClick={() => onStartDrill(summary.weakTopic, 'Medium')}
              className="mt-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Practice {summary.weakTopic} Now</span>
            </button>
          </div>

          {/* Skill Performance Topic Breakdown */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Topic Mastery Breakdown
            </h3>

            <div className="space-y-2.5">
              {summary.topicPerformance.map((tp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{tp.topic}</span>
                    <span
                      className={`font-bold ${
                        tp.average >= 80
                          ? 'text-emerald-600'
                          : tp.average >= 65
                          ? 'text-indigo-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {tp.average}% ({tp.attempts} Qs)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        tp.average >= 80
                          ? 'bg-emerald-500'
                          : tp.average >= 65
                          ? 'bg-[#6C63FF]'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${tp.average}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
