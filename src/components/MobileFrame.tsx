import React, { useState } from 'react';
import { Smartphone, Monitor, Code2, Wifi, Battery, Volume2, Sparkles } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  activeView: 'mobile' | 'fullscreen' | 'code';
  onViewChange: (view: 'mobile' | 'fullscreen' | 'code') => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  activeView,
  onViewChange,
}) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start text-slate-800">
      {/* Top Simulator Control Bar */}
      <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white tracking-wide">AI Interview Coach</span>
          </div>
          <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono">
            React Native + Node.js + Gemini AI
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => onViewChange('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
              activeView === 'mobile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Device</span>
          </button>
          <button
            onClick={() => onViewChange('fullscreen')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
              activeView === 'fullscreen'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full View</span>
          </button>
          <button
            onClick={() => onViewChange('code')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
              activeView === 'code'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Architecture & Code</span>
          </button>
        </div>
      </header>

      {/* Main View Container */}
      <main className="w-full flex-1 flex items-center justify-center p-0 md:p-6">
        {activeView === 'mobile' ? (
          // Realistic iPhone 16 Pro Mobile Frame
          <div className="relative w-full max-w-[410px] h-[844px] bg-[#F8F9FC] md:rounded-[48px] overflow-hidden mobile-frame-shadow flex flex-col border-[6px] border-slate-800">
            {/* Status Bar */}
            <div className="h-11 bg-transparent px-7 flex items-center justify-between text-xs font-semibold text-slate-800 z-40 select-none">
              <span>{currentTime}</span>

              {/* Dynamic Island */}
              <div className="w-24 h-6 bg-black rounded-full flex items-center justify-center gap-2 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-indigo-500/50" />
                <span className="w-2 h-2 rounded-full bg-slate-900" />
              </div>

              <div className="flex items-center gap-1.5 text-slate-700">
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
              {children}
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="h-5 bg-transparent flex items-center justify-center pb-1 z-40">
              <div className="w-32 h-1 bg-slate-400/80 rounded-full" />
            </div>
          </div>
        ) : (
          // Fullscreen Responsive Layout
          <div className="w-full max-w-5xl h-[88vh] bg-[#F8F9FC] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-700">
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
              {children}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
