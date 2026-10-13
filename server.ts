import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/db/store';
import {
  generateInterviewQuestions,
  evaluateCandidateAnswer,
  extractResumeInsights,
} from './src/services/aiService';
import { calculateInterviewSummary } from './src/services/scoringEngine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ai-interview-coach-super-secure-jwt-key-2025';

app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// ==========================================
// AUTH MIDDLEWARE
// ==========================================
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Missing Bearer token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = db.createUser(name, email, passwordHash);

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
  }
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }
  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account registered with this email address.' });
  }

  // Simulated real reset token issuance
  const resetToken = `rst_${Math.random().toString(36).substring(2, 10)}`;
  return res.json({
    success: true,
    message: 'Reset token generated successfully. In production, this is emailed securely.',
    resetToken,
    instructions: 'Use the reset password form with this token to update your password.',
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, resetToken, newPassword } = req.body;
  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, reset token, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  user.password_hash = bcrypt.hashSync(newPassword, 10);
  user.updated_at = new Date().toISOString();

  return res.json({
    success: true,
    message: 'Your password has been updated. You can now log in with your new credentials.',
  });
});

// ==========================================
// 2. PROFILE ENDPOINTS
// ==========================================
app.get('/api/profile', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const user = db.findUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const profile = db.getProfileByUserId(userId);
  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    profile,
  });
});

app.put('/api/profile', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { name, college, experience_level, preferred_role, skills, resume_path } = req.body;

  if (name) {
    const user = db.findUserById(userId);
    if (user) {
      user.name = name;
      user.updated_at = new Date().toISOString();
    }
  }

  const updatedProfile = db.updateProfile(userId, {
    college,
    experience_level,
    preferred_role,
    skills,
    resume_path,
  });

  return res.json({
    success: true,
    message: 'Profile updated successfully.',
    profile: updatedProfile,
  });
});

// ==========================================
// 3. INTERVIEWS & QUESTIONS ENDPOINTS
// ==========================================
app.post('/api/interviews', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      job_role,
      experience_level = '1-2 years',
      interview_type = 'Technical',
      difficulty = 'Medium',
      total_questions = 5,
      target_company,
      mode = 'Voice',
      skills,
      resumeContext,
    } = req.body;

    if (!job_role) {
      return res.status(400).json({ success: false, message: 'job_role is required.' });
    }

    const questionCount = Math.min(15, Math.max(1, parseInt(total_questions, 10) || 5));

    // Create interview record
    const interview = db.createInterview({
      user_id: userId,
      job_role,
      experience_level,
      interview_type,
      difficulty,
      total_questions: questionCount,
      status: 'in_progress',
      target_company,
      mode,
    });

    // Generate AI questions or fallback bank
    const generated = await generateInterviewQuestions({
      role: job_role,
      experienceLevel: experience_level,
      interviewType: interview_type,
      difficulty,
      count: questionCount,
      skills,
      targetCompany: target_company,
      resumeContext,
    });

    const questionRecords = generated.map((g, idx) => ({
      interview_id: interview.id,
      question_text: g.questionText,
      topic: g.topic,
      difficulty: g.difficulty,
      expected_concepts: g.expectedConcepts,
      question_order: idx + 1,
    }));

    const savedQuestions = db.addQuestions(questionRecords);

    return res.status(201).json({
      success: true,
      message: 'Interview session created.',
      interview,
      questions: savedQuestions,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to initialize interview.' });
  }
});

app.get('/api/interviews', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const interviews = db.getInterviewsByUser(userId);
  return res.json({ success: true, interviews });
});

app.get('/api/interviews/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const interviewId = parseInt(req.params.id, 10);

  const interview = db.getInterviewById(interviewId, userId);
  if (!interview) {
    return res.status(404).json({ success: false, message: 'Interview session not found or access denied.' });
  }

  const questions = db.getQuestionsByInterview(interviewId);
  const answers = db.getAnswersByInterview(interviewId);

  // Attach feedback to answers
  const answersWithFeedback = answers.map((ans) => {
    const fb = db.getFeedbackByAnswerId(ans.id);
    return { ...ans, feedback: fb };
  });

  const summary = calculateInterviewSummary(answers);

  return res.json({
    success: true,
    interview,
    questions,
    answers: answersWithFeedback,
    summary,
  });
});

app.get('/api/interviews/:id/questions', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const interviewId = parseInt(req.params.id, 10);

  const interview = db.getInterviewById(interviewId, userId);
  if (!interview) {
    return res.status(404).json({ success: false, message: 'Interview session not found.' });
  }

  const questions = db.getQuestionsByInterview(interviewId);
  return res.json({ success: true, questions });
});

app.post('/api/questions/:id/answer', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const questionId = parseInt(req.params.id, 10);
    const { answer_text = '', answer_mode = 'Text' } = req.body;

    const question = db.getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const interview = db.getInterviewById(question.interview_id, userId);
    if (!interview) {
      return res.status(403).json({ success: false, message: 'Access denied: not your interview.' });
    }

    // Call AI answer evaluation
    const evaluation = await evaluateCandidateAnswer({
      questionText: question.question_text,
      topic: question.topic,
      difficulty: question.difficulty,
      interviewType: interview.interview_type,
      jobRole: interview.job_role,
      expectedConcepts: question.expected_concepts,
      answerText: answer_text,
    });

    const isUnanswered = answer_text.trim().length === 0;

    // Save answer and feedback
    const { answer, feedback } = db.saveAnswerAndFeedback(
      {
        interview_id: interview.id,
        question_id: question.id,
        answer_text,
        answer_mode: answer_mode === 'Voice' ? 'Voice' : 'Text',
        technical_score: evaluation.technical_score,
        relevance_score: evaluation.relevance_score,
        communication_score: evaluation.communication_score,
        structure_score: evaluation.structure_score,
        concept_coverage_score: evaluation.concept_coverage_score,
        overall_score: evaluation.overall_score,
        is_unanswered: isUnanswered,
      },
      {
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        missing_concepts: evaluation.missing_concepts,
        recommendations: evaluation.recommendations,
        sample_answer: evaluation.sample_answer,
        formula_explanation: evaluation.formulaExplanation,
      }
    );

    return res.json({
      success: true,
      message: 'Answer evaluated successfully.',
      answer,
      feedback,
      evaluation,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Evaluation failed.' });
  }
});

app.get('/api/questions/:id/evaluation', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const questionId = parseInt(req.params.id, 10);

  const question = db.getQuestionById(questionId);
  if (!question) {
    return res.status(404).json({ success: false, message: 'Question not found.' });
  }

  const interview = db.getInterviewById(question.interview_id, userId);
  if (!interview) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const answer = db.getAnswerByQuestionId(questionId);
  if (!answer) {
    return res.status(404).json({ success: false, message: 'No answer submitted yet for this question.' });
  }

  const feedback = db.getFeedbackByAnswerId(answer.id);

  return res.json({
    success: true,
    question,
    answer,
    feedback,
  });
});

app.post('/api/interviews/:id/finish', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const interviewId = parseInt(req.params.id, 10);

  const interview = db.getInterviewById(interviewId, userId);
  if (!interview) {
    return res.status(404).json({ success: false, message: 'Interview session not found.' });
  }

  const answers = db.getAnswersByInterview(interviewId);
  const summary = calculateInterviewSummary(answers);

  interview.status = 'completed';
  interview.overall_score = summary.averageScore;
  interview.completed_at = new Date().toISOString();

  return res.json({
    success: true,
    message: 'Interview marked as completed.',
    interview,
    summary,
  });
});

app.delete('/api/interviews/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const interviewId = parseInt(req.params.id, 10);

  const success = db.deleteInterview(interviewId, userId);
  if (!success) {
    return res.status(404).json({ success: false, message: 'Interview not found or unauthorized.' });
  }

  return res.json({ success: true, message: 'Interview deleted successfully.' });
});

// ==========================================
// 4. ANALYTICS & WEAK TOPICS ENDPOINTS
// ==========================================
app.get('/api/analytics/summary', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const userInterviews = db.getInterviewsByUser(userId);

  const completed = userInterviews.filter((i) => i.status === 'completed' && i.overall_score !== null);
  const totalInterviews = completed.length;

  let averageScore = 0;
  if (totalInterviews > 0) {
    const sum = completed.reduce((acc, i) => acc + (i.overall_score || 0), 0);
    averageScore = Math.round((sum / totalInterviews) * 10) / 10;
  }

  // Aggregate topics and scores
  const topicScores: Record<string, { total: number; count: number }> = {};
  completed.forEach((i) => {
    const answers = db.getAnswersByInterview(i.id);
    answers.forEach((ans) => {
      const q = db.getQuestionById(ans.question_id);
      if (q && ans.overall_score > 0) {
        if (!topicScores[q.topic]) topicScores[q.topic] = { total: 0, count: 0 };
        topicScores[q.topic].total += ans.overall_score;
        topicScores[q.topic].count += 1;
      }
    });
  });

  const topicList = Object.keys(topicScores).map((topic) => ({
    topic,
    average: Math.round((topicScores[topic].total / topicScores[topic].count) * 10) / 10,
    attempts: topicScores[topic].count,
  }));

  topicList.sort((a, b) => b.average - a.average);
  const strongestSkill = topicList.length > 0 ? topicList[0].topic : 'Object-Oriented Programming';
  const weakTopic = topicList.length > 1 ? topicList[topicList.length - 1].topic : 'Multithreading & Concurrency';

  return res.json({
    success: true,
    totalInterviews,
    averageScore,
    strongestSkill,
    weakTopic,
    topicPerformance: topicList,
    recentInterviews: userInterviews.slice(0, 5),
  });
});

app.get('/api/analytics/trends', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const userInterviews = db.getInterviewsByUser(userId);
  const completed = userInterviews
    .filter((i) => i.status === 'completed' && i.overall_score !== null)
    .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());

  const trendData = completed.map((i, idx) => ({
    sessionIndex: idx + 1,
    role: i.job_role,
    date: i.started_at.split('T')[0],
    score: i.overall_score,
  }));

  return res.json({ success: true, trends: trendData });
});

app.get('/api/analytics/weak-topics', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const userInterviews = db.getInterviewsByUser(userId);
  const completed = userInterviews.filter((i) => i.status === 'completed');

  const topicScores: Record<string, { total: number; count: number; role: string }> = {};

  completed.forEach((i) => {
    const answers = db.getAnswersByInterview(i.id);
    answers.forEach((ans) => {
      const q = db.getQuestionById(ans.question_id);
      if (q && ans.overall_score > 0) {
        if (!topicScores[q.topic]) topicScores[q.topic] = { total: 0, count: 0, role: i.job_role };
        topicScores[q.topic].total += ans.overall_score;
        topicScores[q.topic].count += 1;
      }
    });
  });

  const weakTopics = Object.keys(topicScores)
    .map((topic) => ({
      topic,
      role: topicScores[topic].role,
      averageScore: Math.round((topicScores[topic].total / topicScores[topic].count) * 10) / 10,
      attempts: topicScores[topic].count,
      recommendedDifficulty:
        topicScores[topic].total / topicScores[topic].count < 65 ? 'Easy' : 'Medium',
    }))
    .filter((t) => t.averageScore < 80)
    .sort((a, b) => a.averageScore - b.averageScore);

  return res.json({ success: true, weakTopics });
});

// ==========================================
// 5. RESUME PARSER & ADAPTIVE SESSIONS
// ==========================================
app.post('/api/resumes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Please provide valid resume text or profile content.' });
    }

    const insights = await extractResumeInsights(resumeText);
    return res.json({ success: true, insights });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to extract resume.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Interview Coach API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    gemini_configured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// ==========================================
// VITE DEV MIDDLEWARE / STATIC FILES
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 AI Interview Coach server is live!`);
    console.log(`➜  Local:   http://localhost:${PORT}/`);
    console.log(`➜  Network: http://127.0.0.1:${PORT}/\n`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
