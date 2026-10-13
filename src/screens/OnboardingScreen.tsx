import React, { useState } from 'react';
import { Mic, Award, Target, ChevronRight, Sparkles } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Mic,
      title: 'Practice Voice & Tech Interviews',
      subtitle: 'Simulate realistic behavioral, HR, and technical rounds with voice transcription or text input.',
      badge: 'Real-Time Voice STT',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      icon: Sparkles,
      title: 'Automated AI Answer Evaluation',
      subtitle: 'Receive instant feedback on Technical Accuracy, Relevance, Communication, Structure, and Concepts.',
      badge: 'Multi-Criteria Scoring',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Target,
      title: 'Personalized Adaptive Analytics',
      subtitle: 'Track your growth over time, spot weak topics, and practice with resume-grounded questions.',
      badge: 'Data-Driven Growth',
      color: 'from-violet-600 to-indigo-600',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-[#F8F9FC] via-white to-indigo-50/40">
      {/* Top Header / Skip */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#6C63FF] flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
            AI
          </div>
          <span className="font-bold text-slate-800 text-sm tracking-tight">Interview Coach</span>
        </div>
        <button
          onClick={onComplete}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md"
        >
          Skip
        </button>
      </div>

      {/* Main Illustration & Card */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-6">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-[#6C63FF] to-[#00D4FF] flex items-center justify-center text-white shadow-xl shadow-indigo-300/40 animate-pulse-ring">
            <StepIcon className="w-16 h-16" />
          </div>
          <span className="absolute -bottom-3 bg-white text-[#6C63FF] border border-indigo-100 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
            {step.badge}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 leading-snug max-w-xs mb-3">
          {step.title}
        </h2>
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
          {step.subtitle}
        </p>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 mt-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-8 bg-[#6C63FF]' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="pb-4">
        <button
          onClick={handleNext}
          className="w-full bg-[#6C63FF] hover:bg-indigo-600 active:scale-[0.98] text-white py-3.5 px-6 rounded-2xl font-semibold shadow-lg shadow-indigo-300/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
