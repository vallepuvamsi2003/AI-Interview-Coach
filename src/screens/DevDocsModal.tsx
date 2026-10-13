import React, { useState } from 'react';
import {
  Code2,
  Database,
  Smartphone,
  Server,
  FileText,
  CheckCircle,
  Copy,
  Terminal,
  BookOpen,
} from 'lucide-react';

export const DevDocsModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rn' | 'backend' | 'mysql' | 'api' | 'android'>('overview');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Top Docs Sub-Navigation */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0 mr-4">
          <Code2 className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-sm tracking-tight text-white">Architecture & Code Specs</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-xs">
          {[
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'rn', label: 'React Native', icon: Smartphone },
            { id: 'backend', label: 'Express Backend', icon: Server },
            { id: 'mysql', label: 'MySQL Schema', icon: Database },
            { id: 'api', label: 'REST API Specs', icon: Terminal },
            { id: 'android', label: 'Android Build', icon: CheckCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Docs Body Content */}
      <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-300 space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              AI Interview Coach - System Architecture Overview
            </h2>
            <p className="leading-relaxed text-slate-300">
              AI Interview Coach is a full-stack cross-platform application designed for students,
              freshers, and senior engineers preparing for technical, HR, and behavioral interviews.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <Smartphone className="w-5 h-5 text-indigo-400 mb-2" />
                <h3 className="font-bold text-white text-sm">Mobile Frontend</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  React Native + Expo, Web Speech API & Expo Speech audio adapters, Axios with JWT interceptors, and high-contrast responsive UI.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <Server className="w-5 h-5 text-[#00D4FF] mb-2" />
                <h3 className="font-bold text-white text-sm">Express REST Backend</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Node.js, Express, JWT Bearer authentication, bcryptjs password hashing, server-side scoring engine with mathematical weighted formulas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <Database className="w-5 h-5 text-emerald-400 mb-2" />
                <h3 className="font-bold text-white text-sm">MySQL Relational DB</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Foreign keys, cascading deletions, JSON columns, user ownership isolation, and seeded question bank.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Deterministic Server-Side Scoring Formula
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                Technical Interview Overall = Technical Accuracy × 0.40 + Relevance × 0.20 + Structure × 0.15 + Concept Coverage × 0.15 + Communication × 0.10
              </p>
              <p className="text-[11px] text-slate-400">
                All criterion scores are strictly clamped between 0 and 100 on the backend before persistent storage to prevent inflated or inaccurate assessments.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'rn' && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-lg font-bold text-white">React Native Mobile Source Architecture</h2>
            <p className="text-slate-300">
              The mobile application source code is structured in the <code className="text-indigo-400">mobile/</code> directory.
            </p>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
{`mobile/
├── app.json                     # Expo permissions: RECORD_AUDIO, INTERNET, NSSpeechRecognition
├── package.json                 # Dependencies: expo-speech, expo-av, react-native-paper, axios
├── src/
│   ├── components/
│   │   ├── PrimaryButton.tsx    # Accessible touchable feedback
│   │   ├── ScoreCard.tsx        # Visual criterion progress bar
│   │   ├── AudioVisualizer.tsx  # Dynamic microphone equalizer
│   ├── screens/
│   │   ├── OnboardingScreen.tsx # 3-stage animated onboarding
│   │   ├── AuthScreen.tsx       # Login & Registration with JWT SecureStore
│   │   ├── HomeScreen.tsx       # Personalized dashboard with live stats
│   │   ├── SessionScreen.tsx    # Live voice STT recording & question reader
│   │   ├── EvaluationScreen.tsx # Rubric scores, strengths & sample answers
│   │   ├── ReportScreen.tsx     # Final interview completion report
│   │   ├── AnalyticsScreen.tsx  # Historical score progression & weak topics
│   │   └── ResumeScreen.tsx     # Resume-grounded interview generator
│   ├── services/
│   │   ├── api.ts               # Axios client with SecureStore token interceptor
│   │   ├── sttService.ts        # Speech-to-text adapter with transcript editing
│   │   └── ttsService.ts        # Expo Speech text-to-speech audio reader
│   ├── constants/theme.ts       # Primary #6C63FF, Secondary #00D4FF
│   └── types/index.ts           # Strictly typed TypeScript models`}
            </pre>
          </div>
        )}

        {activeTab === 'backend' && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-lg font-bold text-white">Node.js Express Backend Structure</h2>
            <p className="text-slate-300">
              The backend follows a clean separation of concerns: routes, controllers, middleware, and services.
            </p>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
{`backend/
├── src/
│   ├── server.js                # Express app initialization & error handling
│   ├── config/db.js             # MySQL2 connection pool & migrations
│   ├── middleware/auth.js       # JWT verification & ownership protection
│   ├── services/
│   │   ├── aiService.js         # Google Gemini API integration (@google/genai)
│   │   └── scoringEngine.js     # Mathematical weighted formula calculation
│   ├── controllers/
│   │   ├── authController.js    # Register, Login, bcrypt hashing, JWT issuance
│   │   ├── interviewController.js # Interview lifecycle (create, get, finish, delete)
│   │   └── questionController.js  # Answer evaluation & feedback persistence
│   └── validators/              # Input sanitization & regex validation
├── database/schema.sql          # Relational schema with foreign keys
├── .env.example                 # Environment variables specification
└── package.json`}
            </pre>
          </div>
        )}

        {activeTab === 'mysql' && (
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">MySQL 8.0 Relational Database Schema</h2>
              <button
                onClick={() => handleCopy(`-- database/schema.sql content`)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-300 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Schema'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed max-h-96">
{`-- Core Tables Defined in /database/schema.sql:
1. users (id, name, email, password_hash, created_at, updated_at)
2. profiles (id, user_id, college, experience_level, preferred_role, skills, resume_path)
3. question_bank (id, role, interview_type, topic, difficulty, question_text, expected_concepts)
4. interviews (id, user_id, job_role, experience_level, interview_type, difficulty, total_questions, overall_score, status)
5. questions (id, interview_id, question_text, topic, difficulty, expected_concepts, question_order)
6. answers (id, interview_id, question_id, answer_text, technical_score, relevance_score, communication_score, structure_score, concept_coverage_score, overall_score)
7. feedback (id, answer_id, strengths, improvements, missing_concepts, recommendations, sample_answer)`}
            </pre>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-lg font-bold text-white">Production REST API Endpoint Reference</h2>

            <div className="space-y-2">
              {[
                { method: 'POST', path: '/api/auth/register', desc: 'Registers new candidate with hashed password' },
                { method: 'POST', path: '/api/auth/login', desc: 'Authenticates candidate & returns JWT bearer token' },
                { method: 'POST', path: '/api/auth/forgot-password', desc: 'Issues verifiable password reset token' },
                { method: 'POST', path: '/api/auth/reset-password', desc: 'Updates password using reset token' },
                { method: 'GET', path: '/api/profile', desc: 'Retrieves candidate profile and skill tags' },
                { method: 'PUT', path: '/api/profile', desc: 'Updates college, experience level, preferred role' },
                { method: 'POST', path: '/api/interviews', desc: 'Creates interview session & generates AI questions' },
                { method: 'GET', path: '/api/interviews', desc: 'Fetches user interview history with ownership checks' },
                { method: 'GET', path: '/api/interviews/:id', desc: 'Fetches session questions, answers, and summary' },
                { method: 'POST', path: '/api/questions/:id/answer', desc: 'Evaluates candidate answer with multi-criteria rubric' },
                { method: 'POST', path: '/api/interviews/:id/finish', desc: 'Calculates final interview score & marks completed' },
                { method: 'GET', path: '/api/analytics/summary', desc: 'Returns overall score, completed count, and skills' },
                { method: 'GET', path: '/api/analytics/trends', desc: 'Returns session scores over time for charts' },
                { method: 'GET', path: '/api/analytics/weak-topics', desc: 'Identifies topics needing improvement (<80%)' },
                { method: 'POST', path: '/api/resumes', desc: 'Extracts resume text for tailored question generation' },
              ].map((ep, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ep.method === 'POST' ? 'bg-indigo-900/60 text-indigo-300' :
                      ep.method === 'GET' ? 'bg-emerald-900/60 text-emerald-300' :
                      ep.method === 'PUT' ? 'bg-amber-900/60 text-amber-300' :
                      'bg-rose-900/60 text-rose-300'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-white text-[11px]">{ep.path}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'android' && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-lg font-bold text-white">Android Build & Deployment Instructions</h2>
            <p className="text-slate-300">
              Steps to compile and run the mobile application on physical Android devices or emulators using Expo EAS:
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-indigo-400 font-bold">1. Install EAS CLI</span>
                <pre className="p-2.5 rounded-xl bg-slate-900 font-mono text-slate-200">
npm install -g eas-cli
                </pre>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-indigo-400 font-bold">2. Configure Backend URL in Mobile</span>
                <p className="text-slate-400">
                  Set your reachable LAN IP or deployed backend URL in <code className="text-white">mobile/.env</code>:
                </p>
                <pre className="p-2.5 rounded-xl bg-slate-900 font-mono text-slate-200">
EXPO_PUBLIC_API_URL=https://your-backend-api.com/api
                </pre>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-indigo-400 font-bold">3. Build Standalone Android APK</span>
                <pre className="p-2.5 rounded-xl bg-slate-900 font-mono text-slate-200">
cd mobile
eas build -p android --profile preview
                </pre>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-indigo-400 font-bold">4. Run Locally on Android Emulator</span>
                <pre className="p-2.5 rounded-xl bg-slate-900 font-mono text-slate-200">
npx expo run:android
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
