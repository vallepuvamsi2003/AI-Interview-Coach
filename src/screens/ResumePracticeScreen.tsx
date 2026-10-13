import React, { useState } from 'react';
import { api } from '../services/apiClient';
import {
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Briefcase,
  Layers,
  Upload,
  Zap,
} from 'lucide-react';

interface ResumePracticeScreenProps {
  onStartWithResume: (resumeContext: string, role: string, skills: string[]) => void;
}

export const ResumePracticeScreen: React.FC<ResumePracticeScreenProps> = ({
  onStartWithResume,
}) => {
  const [resumeText, setResumeText] = useState(
    `Alex Rivera
Software Engineer | 2 Years Experience
Skills: React Native, TypeScript, Node.js, Express, MySQL, REST APIs, Redis, Docker
Projects:
1. FinTech Mobile Wallet: Engineered offline transaction sync with Expo SecureStore and SQLite, reducing latency by 35%.
2. Real-Time Chat Engine: Built WebSockets with Node.js and Redis pub/sub handling 15,000 concurrent active users.`
  );

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    extractedRole: string;
    experienceLevel: string;
    skills: string[];
    projects: string[];
    summary: string;
    suggestedInterviewTopics: string[];
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const handleExtractResume = async () => {
    if (!resumeText || resumeText.trim().length < 20) {
      setError('Please provide at least 20 characters of resume text or profile info.');
      return;
    }

    setError(null);
    setIsExtracting(true);

    try {
      const res = await api.parseResume(resumeText);
      if (res.success && res.insights) {
        setExtractedData(res.insights);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleLaunch = () => {
    if (!extractedData) return;
    onStartWithResume(
      `Candidate Resume Background:\n${resumeText}\nSkills: ${extractedData.skills.join(', ')}\nProjects: ${extractedData.projects.join(', ')}`,
      extractedData.extractedRole || 'Software Engineer',
      extractedData.skills
    );
  };

  return (
    <div className="flex-1 px-4 py-5 space-y-4 pb-24 overflow-y-auto bg-[#F8F9FC]">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#6C63FF] text-[10px] font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3 h-3 text-[#00D4FF]" />
          <span>Resume Grounding Engine</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Resume-Based Interview</h1>
        <p className="text-xs text-slate-500">
          AI analyzes your real projects and generates personalized questions grounded in your background.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Input Resume Card */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#6C63FF]" />
            Paste Resume / Experience Details
          </label>
          <span className="text-[10px] text-slate-400">Plain text / Markdown</span>
        </div>

        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={7}
          placeholder="Paste your resume work experience, tech stack, and key project bullets here..."
          className="w-full p-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] resize-none"
        />

        <button
          onClick={handleExtractResume}
          disabled={isExtracting}
          className="w-full bg-[#6C63FF] hover:bg-indigo-600 active:scale-[0.98] text-white py-3 rounded-2xl font-bold text-xs shadow-md shadow-indigo-300/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isExtracting ? (
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Resume Profile...</span>
            </div>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>Extract Skills & Projects</span>
            </>
          )}
        </button>
      </div>

      {/* Extracted Profile Preview Card */}
      {extractedData && (
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Extracted Role</span>
              <h3 className="text-sm font-bold text-slate-900">{extractedData.extractedRole}</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-indigo-50 text-[#6C63FF]">
              {extractedData.experienceLevel}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Identified Skills</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {extractedData.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-semibold"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Recommended Focus Areas</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {extractedData.suggestedInterviewTopics.map((top, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-semibold"
                >
                  {top}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleLaunch}
            className="w-full mt-2 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] hover:opacity-95 text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-indigo-300/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>Launch Resume Grounded Interview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
