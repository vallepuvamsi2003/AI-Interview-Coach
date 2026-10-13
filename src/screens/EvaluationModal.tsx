import React, { useState } from 'react';
import { Question } from '../types';
import {
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Award,
  ChevronRight,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EvaluationModalProps {
  evaluation: {
    overall_score: number;
    technical_score: number;
    relevance_score: number;
    communication_score: number;
    structure_score: number;
    concept_coverage_score: number;
    strengths: string[];
    improvements: string[];
    missing_concepts: string[];
    recommendations: string[];
    sample_answer: string;
    formulaExplanation?: string;
  };
  question: Question;
  isLastQuestion: boolean;
  onContinue: () => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  evaluation,
  question,
  isLastQuestion,
  onContinue,
}) => {
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  const criteria = [
    { label: 'Technical Accuracy', score: evaluation.technical_score, weight: '40%' },
    { label: 'Answer Relevance', score: evaluation.relevance_score, weight: '20%' },
    { label: 'Concept Coverage', score: evaluation.concept_coverage_score, weight: '15%' },
    { label: 'Answer Structure', score: evaluation.structure_score, weight: '15%' },
    { label: 'Communication Clarity', score: evaluation.communication_score, weight: '10%' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-md max-h-[92vh] bg-white rounded-t-[32px] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-50 text-[#6C63FF]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800">Answer Evaluation</h2>
              <p className="text-[10px] text-slate-400">{question.topic}</p>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full border text-xs font-black ${getScoreColor(
              evaluation.overall_score
            )}`}
          >
            {evaluation.overall_score} / 100
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
          {/* Formula notice */}
          {evaluation.formulaExplanation && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 font-mono">
              <span className="font-semibold text-slate-700">Scoring Engine:</span> {evaluation.formulaExplanation}
            </div>
          )}

          {/* Criterion Breakdown Progress Bars */}
          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 space-y-2.5">
            <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Criterion Scores
            </h3>
            {criteria.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-medium text-slate-600">{item.label}</span>
                  <span className="font-bold text-slate-800">{item.score}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] rounded-full"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Strengths: What You Did Well */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              What You Did Well
            </h3>
            <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 space-y-1.5">
              {evaluation.strengths.map((str, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-700 text-[11px]">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Improvements: What to Improve */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              What to Improve
            </h3>
            <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100 space-y-1.5">
              {evaluation.improvements.map((imp, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-700 text-[11px]">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{imp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Concepts Chips */}
          {evaluation.missing_concepts && evaluation.missing_concepts.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Key Concepts to Hit
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {evaluation.missing_concepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[#6C63FF] text-[10px] font-semibold"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sample Improved Answer Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowSampleAnswer(!showSampleAnswer)}
              className="w-full p-3 bg-slate-50 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#6C63FF]" />
                <span className="text-xs font-bold text-slate-800">Sample Benchmark Answer</span>
              </div>
              {showSampleAnswer ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {showSampleAnswer && (
              <div className="p-3 bg-white text-[11px] text-slate-700 leading-relaxed border-t border-slate-100">
                {evaluation.sample_answer}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Action */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onContinue}
            className="w-full bg-[#6C63FF] hover:bg-indigo-600 active:scale-[0.98] text-white py-3.5 px-6 rounded-2xl font-bold text-xs shadow-lg shadow-indigo-300/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{isLastQuestion ? 'View Final Interview Report' : 'Continue to Next Question'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
