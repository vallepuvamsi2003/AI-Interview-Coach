import { GoogleGenAI, Type } from '@google/genai';
import { calculateOverallScore, CalculatedEvaluation } from './scoringEngine';

// Initialize Gemini Client server-side with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export interface GeneratedQuestion {
  questionText: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expectedConcepts: string[];
}

export interface EvaluationResult {
  technical_score: number;
  relevance_score: number;
  communication_score: number;
  structure_score: number;
  concept_coverage_score: number;
  overall_score: number;
  strengths: string[];
  improvements: string[];
  missing_concepts: string[];
  recommendations: string[];
  sample_answer: string;
  formulaExplanation: string;
}

// CURATED QUESTION BANK FALLBACKS FOR HIGH RELIABILITY
const CURATED_BANK: Record<string, GeneratedQuestion[]> = {
  'Java Developer': [
    {
      questionText: 'Explain polymorphism in Java. What is the difference between compile-time and runtime polymorphism?',
      topic: 'Object-Oriented Programming',
      difficulty: 'Medium',
      expectedConcepts: ['Method Overloading', 'Method Overriding', 'Virtual Method Dispatch', 'Dynamic Binding'],
    },
    {
      questionText: 'How does the Java Garbage Collector manage memory across Eden, Survivor, and Tenured spaces?',
      topic: 'JVM & Memory Management',
      difficulty: 'Hard',
      expectedConcepts: ['Young Generation', 'Old/Tenured Generation', 'Mark and Sweep', 'Stop the world pauses'],
    },
    {
      questionText: 'What is the difference between HashMap, ConcurrentHashMap, and SynchronizedMap in Java?',
      topic: 'Collections & Concurrency',
      difficulty: 'Medium',
      expectedConcepts: ['Bucket locking / CAS operations', 'Segment locking', 'Thread safety vs throughput', 'Null key handling'],
    },
    {
      questionText: 'Explain Spring Boot dependency injection and the lifecycle of a Spring Bean.',
      topic: 'Spring Framework',
      difficulty: 'Medium',
      expectedConcepts: ['Inversion of Control (IoC)', '@Autowired vs Constructor Injection', 'Bean post-processors', '@PostConstruct / @PreDestroy'],
    },
    {
      questionText: 'Describe how you troubleshoot and resolve thread deadlocks in a high-throughput Java application.',
      topic: 'Multithreading',
      difficulty: 'Hard',
      expectedConcepts: ['Thread dump analysis (jstack)', 'Lock acquisition ordering', 'Deadlock detection algorithms', 'Lock timeout with tryLock'],
    },
  ],
  'React Native Developer': [
    {
      questionText: 'Explain the New Architecture of React Native. How do JSI, Fabric, and TurboModules modernize app performance?',
      topic: 'Architecture & Internals',
      difficulty: 'Medium',
      expectedConcepts: ['JavaScript Interface (JSI)', 'Fabric Renderer', 'TurboModules lazy loading', 'Elimination of JSON bridge serialization'],
    },
    {
      questionText: 'How do you optimize 60 FPS list rendering performance in React Native with FlashList or FlatList?',
      topic: 'Performance Optimization',
      difficulty: 'Medium',
      expectedConcepts: ['Cell recycling', 'getItemLayout', 'removeClippedSubviews', 'Avoiding inline functions & memoization'],
    },
    {
      questionText: 'Explain the differences between React Native Reanimated 3 worklets and the standard Animated API.',
      topic: 'Animations & Gestures',
      difficulty: 'Hard',
      expectedConcepts: ['UI thread execution', 'Worklet functions', 'Gesture Handler integration', 'Zero-bridge overhead'],
    },
    {
      questionText: 'How do you handle offline sync, state persistence, and secure token management in React Native?',
      topic: 'State & Security',
      difficulty: 'Medium',
      expectedConcepts: ['Expo SecureStore / EncryptedSharedPreferences', 'MMKV / SQLite local cache', 'Optimistic UI updates', 'Network reconnect queues'],
    },
    {
      questionText: 'What strategies do you adopt for bridging native iOS (Swift/Obj-C) and Android (Kotlin/Java) SDKs into React Native?',
      topic: 'Native Modules',
      difficulty: 'Hard',
      expectedConcepts: ['TurboModule specifications', 'Codegen type generation', 'Promise callbacks & event emitters', 'Threading on Native Queue'],
    },
  ],
  'Python Developer': [
    {
      questionText: 'Explain the Python Global Interpreter Lock (GIL) and its implications for multithreading versus multiprocessing.',
      topic: 'Core Python & Concurrency',
      difficulty: 'Medium',
      expectedConcepts: ['CPython thread execution', 'CPU-bound vs I/O-bound tasks', 'multiprocessing module', 'asyncio event loop'],
    },
    {
      questionText: 'How does Python handle memory allocation and cyclic references in garbage collection?',
      topic: 'Memory Management',
      difficulty: 'Medium',
      expectedConcepts: ['Reference counting', 'Generational garbage collector', 'PyObject memory pools', 'gc module'],
    },
    {
      questionText: 'Explain Python generators, iterators, and the internal mechanics of the yield statement.',
      topic: 'Python Features',
      difficulty: 'Easy',
      expectedConcepts: ['Iterator protocol (__iter__, __next__)', 'Lazy evaluation', 'Memory efficiency', 'Coroutines and yield from'],
    },
    {
      questionText: 'How would you architect a fast, fault-tolerant asynchronous microservice using FastAPI and Pydantic?',
      topic: 'Web Frameworks',
      difficulty: 'Medium',
      expectedConcepts: ['ASGI event loop', 'Pydantic data validation', 'Dependency injection system', 'Async database drivers'],
    },
    {
      questionText: 'What are Python decorators and how do you write a parameterized decorator that preserves function metadata?',
      topic: 'Metaprogramming',
      difficulty: 'Medium',
      expectedConcepts: ['Higher-order functions', 'functools.wraps', 'Closure scope', 'Decorator arguments (*args, **kwargs)'],
    },
  ],
  'Full Stack Developer': [
    {
      questionText: 'How do you design an idempotent payment processing API to prevent duplicate transactions on network failure?',
      topic: 'API Design & Reliability',
      difficulty: 'Hard',
      expectedConcepts: ['Idempotency-Key header', 'Distributed locks (Redis)', 'Atomic database transactions', 'Two-phase commit / Outbox pattern'],
    },
    {
      questionText: 'Explain the trade-offs between Server-Side Rendering (SSR), Static Site Generation (SSG), and Client-Side Rendering (CSR).',
      topic: 'Frontend Architecture',
      difficulty: 'Medium',
      expectedConcepts: ['Time to Interactive (TTI)', 'First Contentful Paint (FCP)', 'SEO advantages', 'Server CPU overhead & hydration'],
    },
    {
      questionText: 'How do you prevent SQL injection, Cross-Site Scripting (XSS), and CSRF in a modern full-stack web stack?',
      topic: 'Web Security',
      difficulty: 'Medium',
      expectedConcepts: ['Parameterized queries / ORM', 'Content Security Policy (CSP)', 'SameSite cookies & anti-CSRF tokens', 'Context-aware output encoding'],
    },
    {
      questionText: 'Describe how you scale a relational database that receives 10,000 writes and 50,000 reads per second.',
      topic: 'Databases & Scaling',
      difficulty: 'Hard',
      expectedConcepts: ['Read replicas', 'Sharding / Partitioning', 'Write-through caching with Redis', 'Message queues for asynchronous writes'],
    },
    {
      questionText: 'What is Database Connection Pooling and why is it essential for Express/Node.js servers connecting to MySQL?',
      topic: 'Backend Performance',
      difficulty: 'Medium',
      expectedConcepts: ['Connection establishment overhead', 'TCP handshake cost', 'Active vs idle connections limit', 'Preventing DB thread exhaustion'],
    },
  ],
};

/**
 * Generate Interview Questions using Gemini or Fallback
 */
export async function generateInterviewQuestions(params: {
  role: string;
  experienceLevel: string;
  interviewType: 'Technical' | 'HR' | 'Behavioral' | 'Mixed';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  count: number;
  skills?: string;
  targetCompany?: string;
  resumeContext?: string;
}): Promise<GeneratedQuestion[]> {
  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `You are a Principal Engineering Hiring Manager conducting an interview for the role "${params.role}".
Experience Level: ${params.experienceLevel}
Interview Type: ${params.interviewType}
Difficulty: ${params.difficulty}
Target Company: ${params.targetCompany || 'Top Tech Company'}
Focus Skills: ${params.skills || 'Core role proficiencies'}
${params.resumeContext ? `Candidate Resume Background:\n${params.resumeContext}` : ''}

Generate exactly ${params.count} realistic, challenging, high-signal interview questions tailored strictly to the criteria above.
For each question, provide:
- questionText: The exact question to ask the candidate.
- topic: Category or subject (e.g. Concurrency, Distributed Systems, STAR Collaboration, etc.).
- difficulty: "Easy", "Medium", or "Hard".
- expectedConcepts: An array of 3-5 technical or behavioral key concepts that a strong candidate must hit.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert technical and HR interviewer. Produce only valid structured JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                topic: { type: Type.STRING },
                difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
                expectedConcepts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['questionText', 'topic', 'difficulty', 'expectedConcepts'],
            },
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim()) as GeneratedQuestion[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, params.count);
        }
      }
    } catch (err) {
      console.warn('Gemini question generation failed or hit rate-limit; falling back to curated question bank:', err);
    }
  }

  // Fallback to high-quality curated bank
  const roleBank = CURATED_BANK[params.role] || CURATED_BANK['Full Stack Developer'];
  const questions: GeneratedQuestion[] = [];
  for (let i = 0; i < params.count; i++) {
    const template = roleBank[i % roleBank.length];
    questions.push({
      questionText: template.questionText,
      topic: template.topic,
      difficulty: params.difficulty || template.difficulty,
      expectedConcepts: template.expectedConcepts,
    });
  }
  return questions;
}

/**
 * Evaluate Candidate Answer using Gemini and Backend Scoring Formula
 */
export async function evaluateCandidateAnswer(params: {
  questionText: string;
  topic: string;
  difficulty: string;
  interviewType: 'Technical' | 'HR' | 'Behavioral' | 'Mixed';
  jobRole: string;
  expectedConcepts: string[];
  answerText: string;
}): Promise<EvaluationResult> {
  const cleanAnswer = params.answerText.trim();
  const isUnanswered = cleanAnswer.length === 0;

  if (isUnanswered) {
    const rawScores = {
      technical_score: 0,
      relevance_score: 0,
      communication_score: 0,
      structure_score: 0,
      concept_coverage_score: 0,
    };
    const scored = calculateOverallScore(params.interviewType, rawScores);
    return {
      ...scored,
      strengths: [],
      improvements: ['You did not submit an answer for this question. Practice answering aloud or writing out key points.'],
      missing_concepts: params.expectedConcepts,
      recommendations: [params.topic, 'Active Recall & Answer Structuring'],
      sample_answer: `A comprehensive answer for "${params.questionText}" should discuss: ${params.expectedConcepts.join(', ')}.`,
    };
  }

  const ai = getGeminiClient();
  let aiRaw = {
    technical_score: 75,
    relevance_score: 75,
    communication_score: 75,
    structure_score: 70,
    concept_coverage_score: 70,
    strengths: ['Addressed the main question prompt.', 'Provided clear explanation of foundational concept.'],
    improvements: ['Include concrete real-world code or project examples to demonstrate depth.', 'Mention underlying runtime mechanics.'],
    missing_concepts: params.expectedConcepts.slice(0, 2),
    recommendations: [params.topic, 'System Design & Tradeoffs'],
    sample_answer: `In ${params.jobRole}, a strong answer explains: ${params.expectedConcepts.join(', ')} with an architectural example.`,
  };

  if (ai) {
    try {
      const evaluationPrompt = `You are an elite interview evaluator for "${params.jobRole}".
Interview Type: ${params.interviewType}
Difficulty: ${params.difficulty}
Topic: ${params.topic}

Question Asked:
"${params.questionText}"

Expected Key Concepts:
${JSON.stringify(params.expectedConcepts)}

Candidate's Answer:
"${cleanAnswer}"

Evaluation Rubric:
- Evaluate the actual answer fairly and objectively.
- Accept technically correct alternative explanations or phrasing without penalizing superficial word differences.
- Check if expected concepts are covered or accurately approximated.
- Assess communication clarity, conciseness, and structured presentation (e.g. STAR for behavioral).
- For Technical: evaluate technical accuracy, concept depth, and engineering precision.
- For HR / Behavioral: evaluate relevance, clear actions, personal accountability, and professionalism.

Provide numeric criterion scores from 0 to 100:
- technical_score (0-100)
- relevance_score (0-100)
- communication_score (0-100)
- structure_score (0-100)
- concept_coverage_score (0-100)

Also provide:
- strengths: array of 2-3 specific bullet points of what the candidate did well.
- improvements: array of 2-3 actionable, respectful bullet points of what to improve.
- missing_concepts: array of key concepts the candidate missed or could have elaborated on.
- recommendations: array of 2-3 specific topics or skills to practice next.
- sample_answer: a concise, stellar, 150-word benchmark answer demonstrating top-tier response structure.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: evaluationPrompt,
        config: {
          systemInstruction: 'You are a senior tech hiring evaluator. Provide rigorous, constructive coaching feedback in strict JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              technical_score: { type: Type.NUMBER },
              relevance_score: { type: Type.NUMBER },
              communication_score: { type: Type.NUMBER },
              structure_score: { type: Type.NUMBER },
              concept_coverage_score: { type: Type.NUMBER },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              missing_concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              sample_answer: { type: Type.STRING },
            },
            required: [
              'technical_score',
              'relevance_score',
              'communication_score',
              'structure_score',
              'concept_coverage_score',
              'strengths',
              'improvements',
              'missing_concepts',
              'recommendations',
              'sample_answer',
            ],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        aiRaw = {
          ...aiRaw,
          ...parsed,
        };
      }
    } catch (err) {
      console.warn('Gemini evaluation failed; applying heuristic rubric scoring:', err);
      // Heuristic scoring based on length and concept matches
      const wordCount = cleanAnswer.split(/\s+/).length;
      let matched = 0;
      const lower = cleanAnswer.toLowerCase();
      params.expectedConcepts.forEach((c) => {
        if (lower.includes(c.toLowerCase()) || c.toLowerCase().split(' ').some((w) => lower.includes(w) && w.length > 3)) {
          matched++;
        }
      });

      const conceptRatio = params.expectedConcepts.length > 0 ? matched / params.expectedConcepts.length : 0.7;
      const lengthBonus = Math.min(25, Math.floor(wordCount / 6));

      aiRaw.technical_score = Math.min(95, Math.max(45, Math.round(50 + conceptRatio * 35 + lengthBonus)));
      aiRaw.concept_coverage_score = Math.min(95, Math.max(40, Math.round(40 + conceptRatio * 50)));
      aiRaw.relevance_score = Math.min(95, Math.max(50, Math.round(60 + (matched > 0 ? 30 : 10))));
      aiRaw.communication_score = wordCount >= 30 ? 82 : wordCount >= 15 ? 72 : 58;
      aiRaw.structure_score = cleanAnswer.includes('\n') || cleanAnswer.includes('.') ? 80 : 65;
    }
  }

  // CRITICAL: Calculate the final weighted score strictly on the backend!
  const finalCalculated = calculateOverallScore(params.interviewType, aiRaw);

  return {
    ...finalCalculated,
    strengths: Array.isArray(aiRaw.strengths) && aiRaw.strengths.length > 0 ? aiRaw.strengths : ['Good core understanding of the problem.'],
    improvements: Array.isArray(aiRaw.improvements) && aiRaw.improvements.length > 0 ? aiRaw.improvements : ['Provide concrete metrics or edge-case handling.'],
    missing_concepts: Array.isArray(aiRaw.missing_concepts) && aiRaw.missing_concepts.length > 0 ? aiRaw.missing_concepts : params.expectedConcepts.slice(0, 2),
    recommendations: Array.isArray(aiRaw.recommendations) && aiRaw.recommendations.length > 0 ? aiRaw.recommendations : [params.topic],
    sample_answer: aiRaw.sample_answer || `Exemplary answer touching upon ${params.expectedConcepts.join(', ')}.`,
  };
}

/**
 * Parse Resume text and extract skills, experience level, and generate tailored questions
 */
export async function extractResumeInsights(resumeText: string) {
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analyze this candidate's resume text and extract key profile details in JSON:
"${resumeText.slice(0, 6000)}"`,
        config: {
          systemInstruction: 'Extract authentic information without hallucinating or inventing credentials.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              extractedRole: { type: Type.STRING },
              experienceLevel: { type: Type.STRING, enum: ['Fresher', '1-2 years', '3-5 years', '5+ years'] },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              projects: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING },
              suggestedInterviewTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['extractedRole', 'experienceLevel', 'skills', 'projects', 'summary', 'suggestedInterviewTopics'],
          },
        },
      });

      if (response.text) {
        return JSON.parse(response.text.trim());
      }
    } catch (err) {
      console.warn('Resume extraction AI failed, using fallback parser:', err);
    }
  }

  // Fallback regex / text analyzer
  const skillsList = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Docker', 'AWS', 'Java', 'Git'];
  const foundSkills = skillsList.filter((s) => resumeText.toLowerCase().includes(s.toLowerCase()));

  return {
    extractedRole: 'Full Stack Software Engineer',
    experienceLevel: resumeText.toLowerCase().includes('senior') ? '5+ years' : resumeText.toLowerCase().includes('years') ? '1-2 years' : 'Fresher',
    skills: foundSkills.length > 0 ? foundSkills : ['JavaScript', 'React', 'Node.js', 'REST APIs'],
    projects: ['Full Stack Web Application', 'Scalable Microservice API'],
    summary: 'Candidate profile extracted from submitted resume.',
    suggestedInterviewTopics: ['System Design', 'State Management', 'Database Query Optimization'],
  };
}
