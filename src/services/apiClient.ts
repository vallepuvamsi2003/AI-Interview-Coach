import {
  User,
  UserProfile,
  Interview,
  Question,
  Answer,
  InterviewSummary,
  AnalyticsSummary,
} from '../types';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('coach_auth_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('coach_auth_token', token);
    } else {
      localStorage.removeItem('coach_auth_token');
    }
  }

  public getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        this.setToken(null);
      }
      throw new Error(data.message || `API error: ${response.statusText}`);
    }

    return data;
  }

  // Auth
  async register(name: string, email: string, password: string, confirmPassword?: string) {
    return this.request<{ success: boolean; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ success: boolean; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async forgotPassword(email: string) {
    return this.request<{ success: boolean; message: string; resetToken?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email: string, resetToken: string, newPassword: string) {
    return this.request<{ success: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, resetToken, newPassword }),
    });
  }

  // Profile
  async getProfile() {
    return this.request<{ success: boolean; user: User; profile: UserProfile }>('/api/profile');
  }

  async updateProfile(updates: Partial<UserProfile & { name?: string }>) {
    return this.request<{ success: boolean; profile: UserProfile }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Interviews
  async createInterview(params: {
    job_role: string;
    experience_level?: string;
    interview_type?: string;
    difficulty?: string;
    total_questions?: number;
    target_company?: string;
    mode?: 'Text' | 'Voice';
    skills?: string;
    resumeContext?: string;
  }) {
    return this.request<{ success: boolean; interview: Interview; questions: Question[] }>('/api/interviews', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getInterviews() {
    return this.request<{ success: boolean; interviews: Interview[] }>('/api/interviews');
  }

  async getInterviewDetails(id: number) {
    return this.request<{
      success: boolean;
      interview: Interview;
      questions: Question[];
      answers: Answer[];
      summary: InterviewSummary;
    }>(`/api/interviews/${id}`);
  }

  async deleteInterview(id: number) {
    return this.request<{ success: boolean }>(`/api/interviews/${id}`, {
      method: 'DELETE',
    });
  }

  async finishInterview(id: number) {
    return this.request<{ success: boolean; interview: Interview; summary: InterviewSummary }>(
      `/api/interviews/${id}/finish`,
      { method: 'POST' }
    );
  }

  // Questions & Answers
  async submitAnswer(questionId: number, answerText: string, mode: 'Text' | 'Voice' = 'Text') {
    return this.request<{
      success: boolean;
      answer: Answer;
      feedback: any;
      evaluation: any;
    }>(`/api/questions/${questionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer_text: answerText, answer_mode: mode }),
    });
  }

  async getQuestionEvaluation(questionId: number) {
    return this.request<{ success: boolean; question: Question; answer: Answer; feedback: any }>(
      `/api/questions/${questionId}/evaluation`
    );
  }

  // Analytics
  async getAnalyticsSummary() {
    return this.request<AnalyticsSummary & { success: boolean }>('/api/analytics/summary');
  }

  async getAnalyticsTrends() {
    return this.request<{ success: boolean; trends: Array<{ sessionIndex: number; role: string; date: string; score: number }> }>(
      '/api/analytics/trends'
    );
  }

  async getWeakTopics() {
    return this.request<{
      success: boolean;
      weakTopics: Array<{ topic: string; role: string; averageScore: number; attempts: number; recommendedDifficulty: string }>;
    }>('/api/analytics/weak-topics');
  }

  // Resume
  async parseResume(resumeText: string) {
    return this.request<{ success: boolean; insights: any }>('/api/resumes', {
      method: 'POST',
      body: JSON.stringify({ resumeText }),
    });
  }
}

export const api = new ApiClient();
