import React, { useState } from 'react';
import { api } from '../services/apiClient';
import { Interview, Question } from '../types';
import {
  X,
  Sparkles,
  Briefcase,
  Layers,
  Sliders,
  Mic,
  FileText,
  Building,
  Target,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface SetupInterviewModalProps {
  initialRole?: string;
  initialType?: string;
  onClose: () => void;
  onInterviewCreated: (interview: Interview, questions: Question[]) => void;
}

export const SetupInterviewModal: React.FC<SetupInterviewModalProps> = ({
  initialRole,
  initialType,
  onClose,
  onInterviewCreated,
}) => {
  const roles = [
    'Java Developer',
    'Python Developer',
    'React Native Developer',
    'Full Stack Developer',
    'AI/ML Engineer',
    'Data Analyst',
    'Software Engineer',
    'Custom Role',
  ];

  const experienceLevels = ['Fresher', '1-2 years', '3-5 years', '5+ years'];
  const interviewTypes = ['Technical', 'HR', 'Behavioral', 'Mixed'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const questionCounts = [3, 5, 10];

  const [role, setRole] = useState(initialRole || 'Full Stack Developer');
  const [customRole, setCustomRole] = useState('');
  const [experience, setExperience] = useState('1-2 years');
  const [interviewType, setInterviewType] = useState(initialType || 'Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(3);
  const [answerMode, setAnswerMode] = useState<'Voice' | 'Text'>('Voice');
  const [targetCompany, setTargetCompany] = useState('');
  const [skills, setSkills] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const selectedRole = role === 'Custom Role' ? customRole.trim() : role;
    if (!selectedRole) {
      setError('Please specify a valid Job Role.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await api.createInterview({
        job_role: selectedRole,
        experience_level: experience,
        interview_type: interviewType,
        difficulty,
        total_questions: questionCount,
        target_company: targetCompany.trim() || undefined,
        mode: answerMode,
        skills: skills.trim() || undefined,
      });

      if (res.success && res.interview && res.questions) {
        onInterviewCreated(res.interview, res.questions);
      } else {
        throw new Error('Could not initialize interview session.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate interview. Check connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-md max-h-[92vh] bg-white rounded-t-[32px] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-50 text-[#6C63FF]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Configure Interview</h2>
              <p className="text-[10px] text-slate-400">Tailored AI questions & structured rubrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Job Role Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Target Job Role</label>
            <div className="grid grid-cols-2 gap-1.5">
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-2 rounded-xl border text-left font-medium transition-all ${
                    role === r
                      ? 'border-[#6C63FF] bg-indigo-50/70 text-[#6C63FF] font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {role === 'Custom Role' && (
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Cloud Security Engineer"
                className="w-full mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-slate-800"
              />
            )}
          </div>

          {/* Experience Level & Interview Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Experience Level</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
              >
                {experienceLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Interview Type</label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
              >
                {interviewTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty & Question Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Difficulty</label>
              <div className="flex rounded-xl bg-slate-100 p-1">
                {difficulties.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 text-center rounded-lg font-semibold transition-all ${
                      difficulty === d
                        ? 'bg-white text-[#6C63FF] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Questions Count</label>
              <div className="flex rounded-xl bg-slate-100 p-1">
                {questionCounts.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-1.5 text-center rounded-lg font-semibold transition-all ${
                      questionCount === count
                        ? 'bg-white text-[#6C63FF] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {count} Qs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Answer Mode (Voice vs Text) */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Answer Input Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAnswerMode('Voice')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-all ${
                  answerMode === 'Voice'
                    ? 'border-[#6C63FF] bg-indigo-50 text-[#6C63FF] font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Mic className="w-4 h-4 text-[#6C63FF]" />
                <div className="text-left">
                  <p className="text-xs">Voice Mode</p>
                  <p className="text-[10px] text-slate-400">Microphone speech-to-text</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAnswerMode('Text')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-all ${
                  answerMode === 'Text'
                    ? 'border-[#6C63FF] bg-indigo-50 text-[#6C63FF] font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-500" />
                <div className="text-left">
                  <p className="text-xs">Text Mode</p>
                  <p className="text-[10px] text-slate-400">Direct typed answer</p>
                </div>
              </button>
            </div>
          </div>

          {/* Optional: Target Company & Skills */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div>
              <label className="font-semibold text-slate-600 block mb-1">
                Target Company <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. Google, Amazon, Startup"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">
                Specific Focus Topics <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Microservices, Concurrency, Redux"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleSubmit}
            disabled={isGenerating}
            className="w-full bg-[#6C63FF] hover:bg-indigo-600 active:scale-[0.98] text-white py-3.5 px-6 rounded-2xl font-bold shadow-lg shadow-indigo-300/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating AI Questions...</span>
              </>
            ) : (
              <>
                <span>Launch Mock Interview</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
