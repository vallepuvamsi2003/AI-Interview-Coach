import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import { Interview, Question, Answer, InterviewSummary } from '../types';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  RotateCcw,
  Home,
  Target,
  ChevronDown,
  ChevronUp,
  Share2,
  Sparkles,
} from 'lucide-react';

interface ReportScreenProps {
  interviewId: number;
  onHome: () => void;
  onStartAnother: (role?: string) => void;
  onPracticeWeakTopics: (topic: string) => void;
}

export const ReportScreen: React.FC<ReportScreenProps> = ({
  interviewId,
  onHome,
  onStartAnother,
  onPracticeWeakTopics,
}) => {
  const [data, setData] = useState<{
    interview: Interview;
    questions: Question[];
    answers: Answer[];
    summary: InterviewSummary;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Mark finish if needed
        await api.finishInterview(interviewId);
        const res = await api.getInterviewDetails(interviewId);
        if (res.success) {
          setData(res);
          // Trigger celebration confetti!
          try {
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#6C63FF', '#00D4FF', '#22C55E', '#F59E0B'],
            });
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        console.warn('Error loading report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [interviewId]);

  if (loading || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-[#6C63FF] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-700">Compiling Final Interview Report...</p>
      </div>
    );
  }

  const { interview, questions, answers, summary } = data;
  const overallScore = summary.averageScore || 0;

  const getVerdict = (score: number) => {
    if (score >= 85) return { label: 'Exceptional (Strong Hire)', color: 'text-emerald-600 bg-emerald-50' };
    if (score >= 70) return { label: 'Solid Performance (Hire)', color: 'text-indigo-600 bg-indigo-50' };
    return { label: 'Needs Practice (Prepare Further)', color: 'text-amber-600 bg-amber-50' };
  };

  const verdict = getVerdict(overallScore);

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#F8F9FC] pb-6">
      {/* Scrollable Report Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header Hero Card */}
        <div className="bg-gradient-to-br from-[#6C63FF] to-[#4F46E5] rounded-3xl p-5 text-white text-center shadow-xl shadow-indigo-300/30 relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-[#00D4FF]" />
            <span>Interview Report Card</span>
          </div>

          <h2 className="text-base font-bold text-white mb-0.5">{interview.job_role}</h2>
          <p className="text-[11px] text-indigo-100 mb-4">
            {interview.interview_type} • {interview.difficulty} • {summary.answeredCount}/{questions.length} Answered
          </p>

          {/* Big Circular Score Display */}
          <div className="w-28 h-28 mx-auto rounded-full bg-white/10 backdrop-blur-md border-4 border-white/30 flex flex-col items-center justify-center shadow-inner mb-3">
            <span className="text-3xl font-black tracking-tight">{overallScore}</span>
            <span className="text-[10px] font-semibold text-indigo-200">OUT OF 100</span>
          </div>

          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${verdict.color}`}>
            {verdict.label}
          </span>
        </div>

        {/* Criterion Averages */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-2.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Evaluation Breakdown
          </h3>

          <div className="space-y-2">
            {[
              { label: 'Technical Accuracy', score: summary.technicalAverage },
              { label: 'Relevance', score: summary.relevanceAverage },
              { label: 'Communication Clarity', score: summary.communicationAverage },
              { label: 'Structure', score: summary.structureAverage },
              { label: 'Concept Coverage', score: summary.conceptAverage },
            ].map((c, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">{c.label}</span>
                  <span className="font-bold text-slate-800">{c.score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] rounded-full"
                    style={{ width: `${c.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question-by-Question Review Accordion */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Question-by-Question Review
          </h3>

          <div className="space-y-2">
            {questions.map((q, idx) => {
              const ans = answers.find((a) => a.question_id === q.id);
              const isExpanded = expandedQuestion === q.id;

              return (
                <div key={q.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                    className="w-full p-3 bg-slate-50/70 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-[#6C63FF] flex items-center justify-center font-bold text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {q.question_text}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ans ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600">
                          {ans.overall_score}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Skipped</span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && ans && (
                    <div className="p-3 bg-white space-y-2.5 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Your Answer</span>
                        <p className="mt-0.5 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {ans.answer_text || '(Unanswered)'}
                        </p>
                      </div>

                      {ans.feedback && (
                        <>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">Strengths</span>
                            {ans.feedback.strengths.map((s, i) => (
                              <p key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                                <span className="text-emerald-500 font-bold">•</span>
                                <span>{s}</span>
                              </p>
                            ))}
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-amber-600 uppercase">Improvements</span>
                            {ans.feedback.improvements.map((im, i) => (
                              <p key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                                <span className="text-amber-500 font-bold">•</span>
                                <span>{im}</span>
                              </p>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="p-4 bg-white border-t border-slate-100 space-y-2 shadow-lg">
        <button
          onClick={() => onStartAnother(interview.job_role)}
          className="w-full bg-[#6C63FF] hover:bg-indigo-600 active:scale-[0.98] text-white py-3 px-6 rounded-2xl font-bold text-xs shadow-md shadow-indigo-300/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake or Practice Again</span>
        </button>

        <button
          onClick={onHome}
          className="w-full bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 py-2.5 px-6 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
