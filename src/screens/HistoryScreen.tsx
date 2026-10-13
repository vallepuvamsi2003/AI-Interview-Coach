import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import { Interview } from '../types';
import {
  History,
  Trash2,
  ChevronRight,
  Filter,
  Calendar,
  Award,
  AlertCircle,
  PlayCircle,
} from 'lucide-react';

interface HistoryScreenProps {
  onOpenReport: (id: number) => void;
  onNewInterview: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onOpenReport, onNewInterview }) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('All');

  const loadHistory = async () => {
    try {
      const res = await api.getInterviews();
      if (res.success) {
        setInterviews(res.interviews);
      }
    } catch (err) {
      console.warn('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this interview record?')) return;

    try {
      await api.deleteInterview(id);
      setInterviews((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert('Failed to delete interview record.');
    }
  };

  const filteredInterviews = interviews.filter((i) => {
    if (filterType === 'All') return true;
    return i.interview_type === filterType;
  });

  return (
    <div className="flex-1 px-4 py-5 space-y-4 pb-24 overflow-y-auto bg-[#F8F9FC]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Interview History</h1>
          <p className="text-xs text-slate-500">Review past transcripts and evaluation feedback</p>
        </div>

        <button
          onClick={onNewInterview}
          className="px-3 py-1.5 bg-[#6C63FF] hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          + New Session
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['All', 'Technical', 'HR', 'Behavioral'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
              filterType === tab
                ? 'bg-[#6C63FF] text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* History List */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-3 border-[#6C63FF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading saved interviews...</p>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200">
          <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">No Interviews in this Category</h3>
          <p className="text-xs text-slate-400 mb-4">Start practicing to track your transcripts here.</p>
          <button
            onClick={onNewInterview}
            className="text-xs font-bold text-[#6C63FF] hover:underline"
          >
            Launch Interview Session →
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredInterviews.map((session) => (
            <div
              key={session.id}
              onClick={() => onOpenReport(session.id)}
              className="bg-white hover:border-indigo-200 p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#6C63FF] flex items-center justify-center font-bold text-sm">
                  {session.mode === 'Voice' ? '🎙️' : '✍️'}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-800 group-hover:text-[#6C63FF] transition-colors">
                    {session.job_role}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{session.interview_type}</span>
                    <span>•</span>
                    <span>{session.difficulty}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(session.started_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {session.overall_score !== null ? (
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-xl ${
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
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                    In Progress
                  </span>
                )}

                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  className="p-1 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
