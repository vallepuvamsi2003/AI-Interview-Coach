/**
 * AI INTERVIEW COACH - BACKEND SCORING ENGINE
 * 
 * Implements server-side mathematical weighted score calculations
 * based on interview type, rubric definitions, and candidate answers.
 */

export interface RawScores {
  technical_score?: number;
  relevance_score?: number;
  communication_score?: number;
  structure_score?: number;
  concept_coverage_score?: number;
}

export interface CalculatedEvaluation {
  technical_score: number;
  relevance_score: number;
  communication_score: number;
  structure_score: number;
  concept_coverage_score: number;
  overall_score: number;
  weights: Record<string, number>;
  formulaExplanation: string;
}

/**
 * Clamps numeric values strictly between 0 and 100 with 1 decimal precision
 */
export function clampScore(val: unknown, fallback = 0): number {
  if (typeof val !== 'number' || isNaN(val)) {
    const parsed = Number(val);
    if (isNaN(parsed)) return fallback;
    return Math.min(100, Math.max(0, Math.round(parsed * 10) / 10));
  }
  return Math.min(100, Math.max(0, Math.round(val * 10) / 10));
}

/**
 * Calculates deterministic overall score based on interview type
 */
export function calculateOverallScore(
  interviewType: 'Technical' | 'HR' | 'Behavioral' | 'Mixed',
  raw: RawScores
): CalculatedEvaluation {
  const technical = clampScore(raw.technical_score, 70);
  const relevance = clampScore(raw.relevance_score, 70);
  const communication = clampScore(raw.communication_score, 70);
  const structure = clampScore(raw.structure_score, 70);
  const conceptCoverage = clampScore(raw.concept_coverage_score, 70);

  let overall = 0;
  let weights: Record<string, number> = {};
  let formulaExplanation = '';

  switch (interviewType) {
    case 'Technical':
      // Technical Accuracy: 40%
      // Relevance: 20%
      // Structure: 15%
      // Concept Coverage: 15%
      // Communication: 10%
      weights = {
        technical_accuracy: 0.40,
        relevance: 0.20,
        structure: 0.15,
        concept_coverage: 0.15,
        communication: 0.10,
      };
      overall =
        technical * 0.40 +
        relevance * 0.20 +
        structure * 0.15 +
        conceptCoverage * 0.15 +
        communication * 0.10;
      formulaExplanation = 'Technical (40%) + Relevance (20%) + Structure (15%) + Concept Coverage (15%) + Communication (10%)';
      break;

    case 'HR':
      // Relevance: 30%
      // Communication Clarity: 30%
      // Structure: 20%
      // Specificity / Professional Presentation: 20%
      weights = {
        relevance: 0.30,
        communication: 0.30,
        structure: 0.20,
        professionalism: 0.20,
      };
      overall =
        relevance * 0.30 +
        communication * 0.30 +
        structure * 0.20 +
        conceptCoverage * 0.20;
      formulaExplanation = 'Relevance (30%) + Communication (30%) + Structure (20%) + Professionalism (20%)';
      break;

    case 'Behavioral':
      // Candidate Actions (STAR): 35%
      // Outcome & Reflection: 25%
      // Relevance & Context: 25%
      // Structure: 15%
      weights = {
        actions: 0.35,
        outcome_reflection: 0.25,
        relevance: 0.25,
        structure: 0.15,
      };
      overall =
        conceptCoverage * 0.35 +
        technical * 0.25 +
        relevance * 0.25 +
        structure * 0.15;
      formulaExplanation = 'Action & Specificity (35%) + Outcome & Reflection (25%) + Relevance (25%) + STAR Structure (15%)';
      break;

    case 'Mixed':
    default:
      // Balanced blended weights
      weights = {
        technical_accuracy: 0.30,
        relevance: 0.25,
        structure: 0.15,
        concept_coverage: 0.15,
        communication: 0.15,
      };
      overall =
        technical * 0.30 +
        relevance * 0.25 +
        structure * 0.15 +
        conceptCoverage * 0.15 +
        communication * 0.15;
      formulaExplanation = 'Technical (30%) + Relevance (25%) + Structure (15%) + Concepts (15%) + Communication (15%)';
      break;
  }

  // Rounded to 1 decimal place
  const finalOverall = Math.round(overall * 10) / 10;

  return {
    technical_score: technical,
    relevance_score: relevance,
    communication_score: communication,
    structure_score: structure,
    concept_coverage_score: conceptCoverage,
    overall_score: finalOverall,
    weights,
    formulaExplanation,
  };
}

/**
 * Computes average interview score and analytics summary from answered questions
 */
export function calculateInterviewSummary(answers: Array<{
  technical_score: number;
  relevance_score: number;
  communication_score: number;
  structure_score: number;
  concept_coverage_score: number;
  overall_score: number;
  is_unanswered?: boolean;
}>) {
  const answered = answers.filter((a) => !a.is_unanswered && a.overall_score > 0);
  if (answered.length === 0) {
    return {
      averageScore: 0,
      technicalAverage: 0,
      relevanceAverage: 0,
      communicationAverage: 0,
      structureAverage: 0,
      conceptAverage: 0,
      answeredCount: 0,
      totalCount: answers.length,
    };
  }

  const sumTech = answered.reduce((acc, a) => acc + (a.technical_score || 0), 0);
  const sumRel = answered.reduce((acc, a) => acc + (a.relevance_score || 0), 0);
  const sumComm = answered.reduce((acc, a) => acc + (a.communication_score || 0), 0);
  const sumStruct = answered.reduce((acc, a) => acc + (a.structure_score || 0), 0);
  const sumConc = answered.reduce((acc, a) => acc + (a.concept_coverage_score || 0), 0);
  const sumOverall = answered.reduce((acc, a) => acc + (a.overall_score || 0), 0);

  const n = answered.length;
  return {
    averageScore: Math.round((sumOverall / n) * 10) / 10,
    technicalAverage: Math.round((sumTech / n) * 10) / 10,
    relevanceAverage: Math.round((sumRel / n) * 10) / 10,
    communicationAverage: Math.round((sumComm / n) * 10) / 10,
    structureAverage: Math.round((sumStruct / n) * 10) / 10,
    conceptAverage: Math.round((sumConc / n) * 10) / 10,
    answeredCount: n,
    totalCount: answers.length,
  };
}
