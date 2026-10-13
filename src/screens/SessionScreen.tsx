import React, { useState, useEffect } from 'react';
import { Interview, Question, Answer } from '../types';
import { api } from '../services/apiClient';
import { speechService } from '../services/speechService';
import {
  Volume2,
  Mic,
  MicOff,
  Send,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Edit3,
  CheckCircle2,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface SessionScreenProps {
  interview: Interview;
  questions: Question[];
  onComplete: () => void;
  onExit: () => void;
  onShowEvaluation: (evaluationData: any, question: Question, isLastQuestion: boolean) => void;
}

export const SessionScreen: React.FC<SessionScreenProps> = ({
  interview,
  questions,
  onComplete,
  onExit,
  onShowEvaluation,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluatingStep, setEvaluatingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  // Stop recording/speaking on question change or unmount
  useEffect(() => {
    return () => {
      speechService.stopListening();
      speechService.stopSpeaking();
    };
  }, []);

  // Listen to question aloud via TTS
  const handleReadQuestion = () => {
    if (isSpeakingQuestion) {
      speechService.stopSpeaking();
      setIsSpeakingQuestion(false);
      return;
    }

    if (!currentQuestion) return;
    setIsSpeakingQuestion(true);
    speechService.speak(currentQuestion.question_text, () => {
      setIsSpeakingQuestion(false);
    });
  };

  // Toggle Voice STT
  const handleToggleVoice = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      setError(null);
      setIsRecording(true);

      speechService.startListening(
        (transcript) => {
          setAnswerText(transcript);
        },
        (err) => {
          setError(err);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
    }
  };

  // Handle Answer Submission & Multi-Step AI Evaluation
  const handleSubmitAnswer = async () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    }

    if (!currentQuestion) return;

    setError(null);
    setIsSubmitting(true);
    setEvaluatingStep('Analyzing answer accuracy & technical concepts...');

    try {
      const stepTimer1 = setTimeout(() => {
        setEvaluatingStep('Evaluating communication clarity & structure...');
      }, 1200);

      const stepTimer2 = setTimeout(() => {
        setEvaluatingStep('Applying backend weighted scoring formula...');
      }, 2400);

      const res = await api.submitAnswer(
        currentQuestion.id,
        answerText,
        interview.mode === 'Voice' ? 'Voice' : 'Text'
      );

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (res.success && res.evaluation) {
        const isLast = currentIndex === questions.length - 1;
        onShowEvaluation(res.evaluation, currentQuestion, isLast);

        // Clear current answer draft
        setAnswerText('');
        setIsEditingTranscript(false);

        if (!isLast) {
          setCurrentIndex((prev) => prev + 1);
        }
      } else {
        throw new Error('Evaluation response invalid.');
      }
    } catch (err: any) {
      setError(err.message || 'Submission error. Please retry.');
    } finally {
      setIsSubmitting(false);
      setEvaluatingStep('');
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <p className="text-sm text-slate-500">No questions loaded for this session.</p>
        <button onClick={onExit} className="mt-3 text-xs text-[#6C63FF] font-bold">Return</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#F8F9FC] relative">
      {/* Top Session Navigation Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between shadow-2xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C63FF]">
            {interview.job_role}
          </span>
          <h2 className="text-xs font-bold text-slate-800">
            Question {currentIndex + 1} of {questions.length}
          </h2>
        </div>

        <button
          onClick={() => setShowExitConfirm(true)}
          className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title="Exit Interview"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5">
        <div
          className="bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] h-1.5 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-[#6C63FF] border border-indigo-100">
              {currentQuestion.topic}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {currentQuestion.difficulty}
              </span>

              {/* TTS Read Question Button */}
              <button
                onClick={handleReadQuestion}
                className={`p-1.5 rounded-xl border transition-all ${
                  isSpeakingQuestion
                    ? 'bg-[#6C63FF] text-white border-[#6C63FF] shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Read question aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {currentQuestion.question_text}
          </h3>
        </div>

        {/* Answer Answering Section */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">Your Answer</span>
              {interview.mode === 'Voice' && (
                <span className="text-[10px] bg-indigo-50 text-[#6C63FF] font-semibold px-2 py-0.5 rounded-md">
                  Voice STT
                </span>
              )}
            </div>

            {answerText.length > 0 && (
              <button
                onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                className="text-[11px] font-semibold text-[#6C63FF] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingTranscript ? 'Done Editing' : 'Edit Transcript'}</span>
              </button>
            )}
          </div>

          {/* Voice Microphone Controller */}
          {interview.mode === 'Voice' && (
            <div className="flex flex-col items-center justify-center py-4 bg-gradient-to-b from-slate-50 to-indigo-50/20 rounded-2xl border border-dashed border-indigo-100">
              <button
                type="button"
                onClick={handleToggleVoice}
                disabled={isSubmitting}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse-ring shadow-rose-300'
                    : 'bg-[#6C63FF] hover:bg-indigo-600 text-white shadow-indigo-300/50'
                }`}
              >
                {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>

              <div className="mt-3 text-center">
                <p className="text-xs font-bold text-slate-800">
                  {isRecording ? 'Listening... Speak your answer' : 'Tap Microphone to Speak'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Microphone speech will be transcribed in real time
                </p>
              </div>

              {/* Animated Audio Equalizer when recording */}
              {isRecording && (
                <div className="flex items-center gap-1.5 mt-3 h-7">
                  <span className="w-1 bg-[#6C63FF] rounded-full audio-bar-1" />
                  <span className="w-1 bg-[#00D4FF] rounded-full audio-bar-2" />
                  <span className="w-1 bg-[#6C63FF] rounded-full audio-bar-3" />
                  <span className="w-1 bg-[#00D4FF] rounded-full audio-bar-4" />
                  <span className="w-1 bg-[#6C63FF] rounded-full audio-bar-5" />
                </div>
              )}
            </div>
          )}

          {/* Transcript / Text Input Area */}
          <div>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              disabled={isSubmitting}
              placeholder={
                interview.mode === 'Voice'
                  ? 'Your spoken transcript will appear here. You can edit before submitting...'
                  : 'Type your structured answer here (explain key concepts, tradeoffs, real-world examples)...'
              }
              rows={4}
              className="w-full p-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] resize-none"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 px-1">
              <span>{answerText.trim().split(/\s+/).filter(Boolean).length} words</span>
              <span>{answerText.length} characters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Submission Action Bar */}
      <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shadow-lg">
        <button
          type="button"
          onClick={() => {
            setAnswerText('');
            if (isRecording) handleToggleVoice();
          }}
          disabled={isSubmitting || answerText.length === 0}
          className="p-3 text-slate-400 hover:text-slate-600 disabled:opacity-30 rounded-xl hover:bg-slate-100 transition-colors"
          title="Clear answer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleSubmitAnswer}
          disabled={isSubmitting}
          className="flex-1 bg-[#6C63FF] hover:bg-indigo-600 active:scale-[0.98] text-white py-3.5 px-6 rounded-2xl font-bold text-xs shadow-lg shadow-indigo-300/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Answer...</span>
            </div>
          ) : (
            <>
              <span>Submit & Evaluate</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Full Analyzing Step Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#6C63FF] mb-4 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">AI Coach is Evaluating</h3>
          <p className="text-xs text-slate-500 max-w-xs">{evaluatingStep}</p>
          <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Exit Interview Session?</h3>
            <p className="text-xs text-slate-500 mb-4">
              Your answered questions have been saved to your history, but the session is incomplete.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Continue Interview
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold"
              >
                Exit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
