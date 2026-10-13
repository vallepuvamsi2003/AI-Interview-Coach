export interface User {
  id: number;
  name: string;
  email: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  college?: string;
  experience_level: 'Fresher' | '1-2 years' | '3-5 years' | '5+ years';
  preferred_role: string;
  skills: string[];
  resume_path?: string;
}

export interface Interview {
  id: number;
  user_id: number;
  job_role: string;
  experience_level: 'Fresher' | '1-2 years' | '3-5 years' | '5+ years';
  interview_type: 'Technical' | 'HR' | 'Behavioral' | 'Mixed';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  total_questions: number;
  overall_score: number | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  target_company?: string;
  mode: 'Text' | 'Voice';
  started_at: string;
  completed_at?: string | null;
}

export interface Question {
  id: number;
  interview_id: number;
  question_text: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expected_concepts: string[];
  question_order: number;
}

export interface AnswerFeedback {
  id: number;
  answer_id: number;
  strengths: string[];
  improvements: string[];
  missing_concepts: string[];
  recommendations: string[];
  sample_answer: string;
  formula_explanation?: string;
}

export interface Answer {
  id: number;
  interview_id: number;
  question_id: number;
  answer_text: string;
  answer_mode: 'Text' | 'Voice';
  technical_score: number;
  relevance_score: number;
  communication_score: number;
  structure_score: number;
  concept_coverage_score: number;
  overall_score: number;
  is_unanswered: boolean;
  submitted_at: string;
  feedback?: AnswerFeedback;
}

export interface InterviewSummary {
  averageScore: number;
  technicalAverage: number;
  relevanceAverage: number;
  communicationAverage: number;
  structureAverage: number;
  conceptAverage: number;
  answeredCount: number;
  totalCount: number;
}

export interface AnalyticsSummary {
  totalInterviews: number;
  averageScore: number;
  strongestSkill: string;
  weakTopic: string;
  topicPerformance: Array<{
    topic: string;
    average: number;
    attempts: number;
  }>;
  recentInterviews: Interview[];
}
