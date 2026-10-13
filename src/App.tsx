/**
 * AI INTERVIEW COACH - APPLICATION ENTRY POINT
 * Complete Full-Stack Mobile Simulation & Interactive Application
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MobileFrame } from './components/MobileFrame';
import { BottomTabs } from './components/BottomTabs';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SetupInterviewModal } from './screens/SetupInterviewModal';
import { SessionScreen } from './screens/SessionScreen';
import { EvaluationModal } from './screens/EvaluationModal';
import { ReportScreen } from './screens/ReportScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ResumePracticeScreen } from './screens/ResumePracticeScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { DevDocsModal } from './screens/DevDocsModal';
import { Interview, Question } from './types';

function MainApp() {
  const { user, isLoading, logout } = useAuth();

  // Navigation State
  const [viewMode, setViewMode] = useState<'mobile' | 'fullscreen' | 'code'>('mobile');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('coach_onboarding_done') === 'true';
  });
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Interview Session Flow State
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupPreset, setSetupPreset] = useState<{ role?: string; type?: string } | undefined>(undefined);
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);

  // Active Evaluation Modal State
  const [evaluationModalData, setEvaluationModalData] = useState<{
    evaluation: any;
    question: Question;
    isLastQuestion: boolean;
  } | null>(null);

  // Active Report View State
  const [activeReportId, setActiveReportId] = useState<number | null>(null);

  const handleFinishOnboarding = () => {
    localStorage.setItem('coach_onboarding_done', 'true');
    setHasCompletedOnboarding(true);
  };

  const handleStartInterview = (preset?: { role?: string; type?: string }) => {
    setSetupPreset(preset);
    setSetupModalOpen(true);
  };

  const handleInterviewCreated = (interview: Interview, questions: Question[]) => {
    setSetupModalOpen(false);
    setActiveReportId(null);
    setEvaluationModalData(null);
    setActiveInterview(interview);
    setActiveQuestions(questions);
  };

  const handleShowEvaluation = (evaluationData: any, question: Question, isLastQuestion: boolean) => {
    setEvaluationModalData({
      evaluation: evaluationData,
      question,
      isLastQuestion,
    });
  };

  const handleContinueAfterEvaluation = () => {
    if (!evaluationModalData) return;
    const isLast = evaluationModalData.isLastQuestion;
    setEvaluationModalData(null);

    if (isLast && activeInterview) {
      const finishedId = activeInterview.id;
      setActiveInterview(null);
      setActiveQuestions([]);
      setActiveReportId(finishedId);
    }
  };

  const handleOpenReport = (interviewId: number) => {
    setActiveInterview(null);
    setActiveReportId(interviewId);
  };

  const handleExitInterview = () => {
    setActiveInterview(null);
    setActiveQuestions([]);
    setEvaluationModalData(null);
    setCurrentTab('home');
  };

  // If viewing developer architecture & code documentation
  if (viewMode === 'code') {
    return (
      <MobileFrame activeView={viewMode} onViewChange={setViewMode}>
        <DevDocsModal />
      </MobileFrame>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <MobileFrame activeView={viewMode} onViewChange={setViewMode}>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 border-3 border-[#6C63FF] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-700">Connecting to AI Interview Coach...</p>
        </div>
      </MobileFrame>
    );
  }

  // 1. Onboarding Screen
  if (!hasCompletedOnboarding) {
    return (
      <MobileFrame activeView={viewMode} onViewChange={setViewMode}>
        <OnboardingScreen onComplete={handleFinishOnboarding} />
      </MobileFrame>
    );
  }

  // 2. Authentication Screen (Login, Register, Forgot Password, Demo Login)
  if (!user) {
    return (
      <MobileFrame activeView={viewMode} onViewChange={setViewMode}>
        <AuthScreen onSuccess={() => setCurrentTab('home')} />
      </MobileFrame>
    );
  }

  // 3. Active Interview Session Screen
  if (activeInterview && activeQuestions.length > 0) {
    return (
      <MobileFrame activeView={viewMode} onViewChange={setViewMode}>
        <SessionScreen
          interview={activeInterview}
          questions={activeQuestions}
          onComplete={() => {
            const finishedId = activeInterview.id;
            setActiveInterview(null);
            setActiveReportId(finishedId);
          }}
          onExit={handleExitInterview}
          onShowEvaluation={handleShowEvaluation}
        />

        {/* Question Evaluation Modal */}
        {evaluationModalData && (
          <EvaluationModal
            evaluation={evaluationModalData.evaluation}
            question={evaluationModalData.question}
            isLastQuestion={evaluationModalData.isLastQuestion}
            onContinue={handleContinueAfterEvaluation}
          />
        )}
      </MobileFrame>
    );
  }

  // 4. Completed Interview Report Screen
  if (activeReportId) {
    return (
      <MobileFrame activeView={viewMode} onViewChange={setViewMode}>
        <ReportScreen
          interviewId={activeReportId}
          onHome={() => {
            setActiveReportId(null);
            setCurrentTab('home');
          }}
          onStartAnother={(role) => {
            setActiveReportId(null);
            handleStartInterview({ role });
          }}
          onPracticeWeakTopics={(topic) => {
            setActiveReportId(null);
            handleStartInterview({ role: topic });
          }}
        />
      </MobileFrame>
    );
  }

  // 5. Main App Tabs (Home, Practice, History, Analytics, Profile)
  return (
    <MobileFrame activeView={viewMode} onViewChange={setViewMode}>
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex-1 flex flex-col">
          {currentTab === 'home' && (
            <HomeScreen
              onStartInterview={handleStartInterview}
              onOpenReport={handleOpenReport}
              onOpenPractice={() => setCurrentTab('practice')}
            />
          )}

          {currentTab === 'practice' && (
            <ResumePracticeScreen
              onStartWithResume={(resumeContext, role, skills) => {
                handleStartInterview({ role });
              }}
            />
          )}

          {currentTab === 'history' && (
            <HistoryScreen
              onOpenReport={handleOpenReport}
              onNewInterview={() => handleStartInterview()}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsScreen
              onStartDrill={(topic, difficulty) => {
                handleStartInterview({ role: topic });
              }}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileScreen onLogout={logout} />
          )}
        </div>

        {/* Native Mobile Bottom Navigation Bar */}
        <BottomTabs currentTab={currentTab} onSelectTab={setCurrentTab} />
      </div>

      {/* Setup Interview Configuration Modal */}
      {setupModalOpen && (
        <SetupInterviewModal
          initialRole={setupPreset?.role}
          initialType={setupPreset?.type}
          onClose={() => setSetupModalOpen(false)}
          onInterviewCreated={handleInterviewCreated}
        />
      )}
    </MobileFrame>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
