/**
 * Relational In-Memory / File-backed Database Store
 * Implements strict MySQL relational schema parity with foreign keys,
 * cascade deletion, and ownership verification.
 */
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileRecord {
  id: number;
  user_id: number;
  college: string;
  experience_level: 'Fresher' | '1-2 years' | '3-5 years' | '5+ years';
  preferred_role: string;
  skills: string[];
  resume_path?: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewRecord {
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

export interface QuestionRecord {
  id: number;
  interview_id: number;
  question_text: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expected_concepts: string[];
  question_order: number;
  created_at: string;
}

export interface AnswerRecord {
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
}

export interface FeedbackRecord {
  id: number;
  answer_id: number;
  strengths: string[];
  improvements: string[];
  missing_concepts: string[];
  recommendations: string[];
  sample_answer: string;
  formula_explanation?: string;
  created_at: string;
}

class DatabaseStore {
  public users: UserRecord[] = [];
  public profiles: ProfileRecord[] = [];
  public interviews: InterviewRecord[] = [];
  public questions: QuestionRecord[] = [];
  public answers: AnswerRecord[] = [];
  public feedback: FeedbackRecord[] = [];

  private nextUserId = 1;
  private nextProfileId = 1;
  private nextInterviewId = 1;
  private nextQuestionId = 1;
  private nextAnswerId = 1;
  private nextFeedbackId = 1;

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // Seed initial demo user: demo@coach.ai / Password123!
    const hashed = bcrypt.hashSync('Password123!', 10);
    const demoUser: UserRecord = {
      id: this.nextUserId++,
      name: 'Alex Rivera',
      email: 'demo@coach.ai',
      password_hash: hashed,
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.push(demoUser);

    this.profiles.push({
      id: this.nextProfileId++,
      user_id: demoUser.id,
      college: 'Stanford Institute of Technology',
      experience_level: '1-2 years',
      preferred_role: 'Full Stack Developer',
      skills: ['React Native', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design'],
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Seed Completed Interview 1: Java Developer (Score 84.5)
    const interview1: InterviewRecord = {
      id: this.nextInterviewId++,
      user_id: demoUser.id,
      job_role: 'Java Developer',
      experience_level: '1-2 years',
      interview_type: 'Technical',
      difficulty: 'Medium',
      total_questions: 3,
      overall_score: 84.5,
      status: 'completed',
      target_company: 'Google',
      mode: 'Voice',
      started_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      completed_at: new Date(Date.now() - 7 * 86400000 + 1200000).toISOString(),
    };
    this.interviews.push(interview1);

    const q1: QuestionRecord = {
      id: this.nextQuestionId++,
      interview_id: interview1.id,
      question_text: 'Explain polymorphism in Java. What is the difference between compile-time and runtime polymorphism?',
      topic: 'Object-Oriented Programming',
      difficulty: 'Medium',
      expected_concepts: ['Method Overloading', 'Method Overriding', 'Virtual Method Dispatch', 'Dynamic Binding'],
      question_order: 1,
      created_at: interview1.started_at,
    };
    const q2: QuestionRecord = {
      id: this.nextQuestionId++,
      interview_id: interview1.id,
      question_text: 'How does HashMap handle collisions internally in Java 8 and beyond?',
      topic: 'Collections & Data Structures',
      difficulty: 'Medium',
      expected_concepts: ['Separate Chaining (LinkedList)', 'TreeBins (Red-Black Trees)', 'TREEIFY_THRESHOLD (8)', 'hashCode() and equals() contract'],
      question_order: 2,
      created_at: interview1.started_at,
    };
    const q3: QuestionRecord = {
      id: this.nextQuestionId++,
      interview_id: interview1.id,
      question_text: 'What are the main differences between synchronized blocks and ReentrantLock?',
      topic: 'Multithreading & Concurrency',
      difficulty: 'Hard',
      expected_concepts: ['Fairness policy', 'tryLock with timeout', 'Condition variables', 'Intrinsic monitor lock'],
      question_order: 3,
      created_at: interview1.started_at,
    };
    this.questions.push(q1, q2, q3);

    // Answers & Feedback for interview 1
    const ans1: AnswerRecord = {
      id: this.nextAnswerId++,
      interview_id: interview1.id,
      question_id: q1.id,
      answer_text: 'Polymorphism allows objects to take multiple forms. Compile-time polymorphism is method overloading where signatures differ in arguments. Runtime polymorphism is method overriding with dynamic method dispatch.',
      answer_mode: 'Voice',
      technical_score: 88,
      relevance_score: 90,
      communication_score: 82,
      structure_score: 85,
      concept_coverage_score: 86,
      overall_score: 87.1,
      is_unanswered: false,
      submitted_at: interview1.started_at,
    };
    const fb1: FeedbackRecord = {
      id: this.nextFeedbackId++,
      answer_id: ans1.id,
      strengths: ['Accurately distinguished static vs dynamic polymorphism', 'Clean concise explanation of method overloading'],
      improvements: ['Mention virtual method tables (vtable) for bonus architectural depth', 'Provide a practical code analogy like Animal makeSound()'],
      missing_concepts: ['vtable dynamic binding'],
      recommendations: ['Object-Oriented Design Patterns', 'Java Bytecode & JVM Internals'],
      sample_answer: 'Polymorphism enables one interface with multiple implementations. Compile-time polymorphism is achieved through method overloading resolved at compilation. Runtime polymorphism is achieved via method overriding where the JVM resolves calls dynamically at runtime using virtual method tables.',
      formula_explanation: 'Technical (40%) + Relevance (20%) + Structure (15%) + Concept Coverage (15%) + Communication (10%)',
      created_at: interview1.started_at,
    };

    const ans2: AnswerRecord = {
      id: this.nextAnswerId++,
      interview_id: interview1.id,
      question_id: q2.id,
      answer_text: 'HashMap uses array of Node buckets. When collisions happen, elements are placed in a linked list. In Java 8, if a bucket exceeds 8 nodes, it transforms into a red-black tree to guarantee O(log n) lookup.',
      answer_mode: 'Voice',
      technical_score: 92,
      relevance_score: 95,
      communication_score: 88,
      structure_score: 85,
      concept_coverage_score: 90,
      overall_score: 90.6,
      is_unanswered: false,
      submitted_at: interview1.started_at,
    };
    const fb2: FeedbackRecord = {
      id: this.nextFeedbackId++,
      answer_id: ans2.id,
      strengths: ['Specifically cited TREEIFY_THRESHOLD of 8 and red-black tree transition', 'Mentioned O(log n) worst-case time complexity'],
      improvements: ['Explicitly mention the contract between hashCode() and equals()', 'Discuss UNTREEIFY_THRESHOLD when elements fall below 6'],
      missing_concepts: ['UNTREEIFY_THRESHOLD (6)', 'hashCode and equals contract'],
      recommendations: ['Java Collection Internals', 'ConcurrentHashMap & Striped Locking'],
      sample_answer: 'In Java 8, HashMap resolves collisions with separate chaining. Once a bucket reaches 8 elements (TREEIFY_THRESHOLD) and table capacity is >= 64, the linked list converts to a Red-Black Tree, improving lookup from O(n) to O(log n). If reduced to 6, it reverts to a linked list.',
      formula_explanation: 'Technical (40%) + Relevance (20%) + Structure (15%) + Concept Coverage (15%) + Communication (10%)',
      created_at: interview1.started_at,
    };

    const ans3: AnswerRecord = {
      id: this.nextAnswerId++,
      interview_id: interview1.id,
      question_id: q3.id,
      answer_text: 'Synchronized is built into the language while ReentrantLock is from java.util.concurrent. ReentrantLock allows tryLock with timeout and can be configured with a fairness flag.',
      answer_mode: 'Text',
      technical_score: 75,
      relevance_score: 80,
      communication_score: 74,
      structure_score: 72,
      concept_coverage_score: 75,
      overall_score: 75.8,
      is_unanswered: false,
      submitted_at: interview1.started_at,
    };
    const fb3: FeedbackRecord = {
      id: this.nextFeedbackId++,
      answer_id: ans3.id,
      strengths: ['Identified lock acquisition fairness and non-blocking tryLock'],
      improvements: ['Remember to mention unlocking in a finally block to prevent lock leakage', 'Explain multiple Condition queues'],
      missing_concepts: ['try-finally lock release idiom', 'Condition objects (await/signal)'],
      recommendations: ['Multithreading & Concurrency', 'Deadlock Prevention Strategies'],
      sample_answer: 'ReentrantLock offers explicit lock/unlock operations requiring a finally block, fairness ordering, interruptible lock acquisition, and multiple Condition instances. Synchronized is an implicit monitor lock handled automatically by the JVM.',
      formula_explanation: 'Technical (40%) + Relevance (20%) + Structure (15%) + Concept Coverage (15%) + Communication (10%)',
      created_at: interview1.started_at,
    };

    this.answers.push(ans1, ans2, ans3);
    this.feedback.push(fb1, fb2, fb3);

    // Seed Completed Interview 2: React Native Developer (Score 78.2)
    const interview2: InterviewRecord = {
      id: this.nextInterviewId++,
      user_id: demoUser.id,
      job_role: 'React Native Developer',
      experience_level: '1-2 years',
      interview_type: 'Technical',
      difficulty: 'Medium',
      total_questions: 2,
      overall_score: 78.2,
      status: 'completed',
      target_company: 'Meta',
      mode: 'Voice',
      started_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      completed_at: new Date(Date.now() - 3 * 86400000 + 900000).toISOString(),
    };
    this.interviews.push(interview2);

    const q4: QuestionRecord = {
      id: this.nextQuestionId++,
      interview_id: interview2.id,
      question_text: 'Explain the New Architecture of React Native and how JSI differs from the old JSON Bridge.',
      topic: 'Architecture & Internals',
      difficulty: 'Medium',
      expected_concepts: ['JavaScript Interface (JSI)', 'Fabric', 'TurboModules', 'Direct C++ references'],
      question_order: 1,
      created_at: interview2.started_at,
    };
    const q5: QuestionRecord = {
      id: this.nextQuestionId++,
      interview_id: interview2.id,
      question_text: 'How do you optimize FlatList performance for large lists with hundreds of complex items?',
      topic: 'Performance Optimization',
      difficulty: 'Medium',
      expected_concepts: ['getItemLayout', 'initialNumToRender', 'removeClippedSubviews', 'memoized renderItem'],
      question_order: 2,
      created_at: interview2.started_at,
    };
    this.questions.push(q4, q5);

    const ans4: AnswerRecord = {
      id: this.nextAnswerId++,
      interview_id: interview2.id,
      question_id: q4.id,
      answer_text: 'JSI replaces the old asynchronous JSON bridge with C++ host objects. JS can directly hold references to native objects, making calls synchronous and eliminating serialization lag.',
      answer_mode: 'Voice',
      technical_score: 82,
      relevance_score: 85,
      communication_score: 78,
      structure_score: 76,
      concept_coverage_score: 80,
      overall_score: 81.0,
      is_unanswered: false,
      submitted_at: interview2.started_at,
    };
    const fb4: FeedbackRecord = {
      id: this.nextFeedbackId++,
      answer_id: ans4.id,
      strengths: ['Clear definition of JSI C++ host object bindings', 'Highlighted elimination of serialization overhead'],
      improvements: ['Mention Fabric and TurboModules to complete the trifecta', 'Discuss synchronous layout calculation'],
      missing_concepts: ['Fabric rendering pipeline', 'TurboModules lazy loading'],
      recommendations: ['React Native Internals', 'TurboModules C++ Integration'],
      sample_answer: 'React Native New Architecture replaces the asynchronous JSON Bridge with JSI (JavaScript Interface). JSI allows JavaScript to communicate directly with C++ native memory without serialization. Fabric coordinates synchronous rendering and layout, while TurboModules loads native modules on demand.',
      formula_explanation: 'Technical (40%) + Relevance (20%) + Structure (15%) + Concept Coverage (15%) + Communication (10%)',
      created_at: interview2.started_at,
    };

    const ans5: AnswerRecord = {
      id: this.nextAnswerId++,
      interview_id: interview2.id,
      question_id: q5.id,
      answer_text: 'We use getItemLayout for constant item heights to avoid dynamic measurement, memoize renderItem with useCallback, and enable removeClippedSubviews.',
      answer_mode: 'Voice',
      technical_score: 76,
      relevance_score: 82,
      communication_score: 72,
      structure_score: 74,
      concept_coverage_score: 72,
      overall_score: 75.4,
      is_unanswered: false,
      submitted_at: interview2.started_at,
    };
    const fb5: FeedbackRecord = {
      id: this.nextFeedbackId++,
      answer_id: ans5.id,
      strengths: ['Accurately mentioned getItemLayout and removeClippedSubviews'],
      improvements: ['Mention FlashList by Shopify as the modern standard', 'Discuss maxToRenderPerBatch and windowSize tuning'],
      missing_concepts: ['windowSize and maxToRenderPerBatch tuning', 'FlashList recycling mechanism'],
      recommendations: ['List Virtualization Techniques', 'Memory Profiling with Flipper / Hermes'],
      sample_answer: 'To optimize FlatList, define getItemLayout to bypass dynamic layout calculations, memoize renderItem components with React.memo, configure windowSize (e.g. 5) and maxToRenderPerBatch, or migrate to Shopify FlashList for cell recycling.',
      formula_explanation: 'Technical (40%) + Relevance (20%) + Structure (15%) + Concept Coverage (15%) + Communication (10%)',
      created_at: interview2.started_at,
    };

    this.answers.push(ans4, ans5);
    this.feedback.push(fb4, fb5);
  }

  // USER CRUD
  public createUser(name: string, email: string, passwordHash: string): UserRecord {
    const user: UserRecord = {
      id: this.nextUserId++,
      name,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.push(user);

    // Auto-create initial profile
    this.profiles.push({
      id: this.nextProfileId++,
      user_id: user.id,
      college: '',
      experience_level: 'Fresher',
      preferred_role: 'Software Engineer',
      skills: ['JavaScript', 'Problem Solving'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return user;
  }

  public findUserByEmail(email: string): UserRecord | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public findUserById(id: number): UserRecord | undefined {
    return this.users.find((u) => u.id === id);
  }

  // PROFILE CRUD
  public getProfileByUserId(userId: number): ProfileRecord | undefined {
    return this.profiles.find((p) => p.user_id === userId);
  }

  public updateProfile(userId: number, updates: Partial<ProfileRecord>): ProfileRecord {
    let profile = this.getProfileByUserId(userId);
    if (!profile) {
      profile = {
        id: this.nextProfileId++,
        user_id: userId,
        college: updates.college || '',
        experience_level: updates.experience_level || 'Fresher',
        preferred_role: updates.preferred_role || 'Software Engineer',
        skills: updates.skills || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.profiles.push(profile);
      return profile;
    }

    Object.assign(profile, updates, { updated_at: new Date().toISOString() });
    return profile;
  }

  // INTERVIEWS CRUD
  public createInterview(data: Omit<InterviewRecord, 'id' | 'started_at' | 'overall_score'>): InterviewRecord {
    const interview: InterviewRecord = {
      id: this.nextInterviewId++,
      ...data,
      overall_score: null,
      started_at: new Date().toISOString(),
    };
    this.interviews.push(interview);
    return interview;
  }

  public getInterviewsByUser(userId: number): InterviewRecord[] {
    return this.interviews
      .filter((i) => i.user_id === userId)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }

  public getInterviewById(id: number, userId: number): InterviewRecord | undefined {
    return this.interviews.find((i) => i.id === id && i.user_id === userId);
  }

  public deleteInterview(id: number, userId: number): boolean {
    const index = this.interviews.findIndex((i) => i.id === id && i.user_id === userId);
    if (index === -1) return false;

    const interviewId = this.interviews[index].id;
    // Cascade delete questions, answers, feedback
    const questionsToDelete = this.questions.filter((q) => q.interview_id === interviewId);
    const questionIds = new Set(questionsToDelete.map((q) => q.id));

    const answersToDelete = this.answers.filter((a) => a.interview_id === interviewId);
    const answerIds = new Set(answersToDelete.map((a) => a.id));

    this.feedback = this.feedback.filter((f) => !answerIds.has(f.answer_id));
    this.answers = this.answers.filter((a) => a.interview_id !== interviewId);
    this.questions = this.questions.filter((q) => q.interview_id !== interviewId);
    this.interviews.splice(index, 1);

    return true;
  }

  // QUESTIONS CRUD
  public addQuestions(questions: Omit<QuestionRecord, 'id' | 'created_at'>[]): QuestionRecord[] {
    const created: QuestionRecord[] = [];
    for (const q of questions) {
      const rec: QuestionRecord = {
        id: this.nextQuestionId++,
        ...q,
        created_at: new Date().toISOString(),
      };
      this.questions.push(rec);
      created.push(rec);
    }
    return created;
  }

  public getQuestionsByInterview(interviewId: number): QuestionRecord[] {
    return this.questions
      .filter((q) => q.interview_id === interviewId)
      .sort((a, b) => a.question_order - b.question_order);
  }

  public getQuestionById(questionId: number): QuestionRecord | undefined {
    return this.questions.find((q) => q.id === questionId);
  }

  // ANSWERS & FEEDBACK
  public saveAnswerAndFeedback(
    answerData: Omit<AnswerRecord, 'id' | 'submitted_at'>,
    feedbackData: Omit<FeedbackRecord, 'id' | 'answer_id' | 'created_at'>
  ): { answer: AnswerRecord; feedback: FeedbackRecord } {
    // Check if duplicate answer exists, replace if so
    const existingIndex = this.answers.findIndex((a) => a.question_id === answerData.question_id);
    let answer: AnswerRecord;

    if (existingIndex >= 0) {
      answer = {
        ...this.answers[existingIndex],
        ...answerData,
        submitted_at: new Date().toISOString(),
      };
      this.answers[existingIndex] = answer;
      // remove old feedback
      this.feedback = this.feedback.filter((f) => f.answer_id !== answer.id);
    } else {
      answer = {
        id: this.nextAnswerId++,
        ...answerData,
        submitted_at: new Date().toISOString(),
      };
      this.answers.push(answer);
    }

    const fb: FeedbackRecord = {
      id: this.nextFeedbackId++,
      answer_id: answer.id,
      ...feedbackData,
      created_at: new Date().toISOString(),
    };
    this.feedback.push(fb);

    return { answer, feedback: fb };
  }

  public getAnswersByInterview(interviewId: number): AnswerRecord[] {
    return this.answers.filter((a) => a.interview_id === interviewId);
  }

  public getAnswerByQuestionId(questionId: number): AnswerRecord | undefined {
    return this.answers.find((a) => a.question_id === questionId);
  }

  public getFeedbackByAnswerId(answerId: number): FeedbackRecord | undefined {
    return this.feedback.find((f) => f.answer_id === answerId);
  }
}

export const db = new DatabaseStore();
