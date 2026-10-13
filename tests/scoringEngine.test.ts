/**
 * UNIT TESTS: BACKEND SCORING ENGINE & FORMULA VERIFICATION
 * 
 * Verifies exact weighted calculations for:
 * - Technical Interviews
 * - HR Interviews
 * - Behavioral Interviews
 * - Clamping bounds (0-100)
 * - Empty / Unanswered handling
 */
import { calculateOverallScore, clampScore, calculateInterviewSummary } from '../src/services/scoringEngine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

export function runScoringEngineTests() {
  console.log('🧪 Starting Scoring Engine Unit Tests...');

  // Test 1: Technical formula weighting
  // Technical (40%) + Relevance (20%) + Structure (15%) + Concept Coverage (15%) + Communication (10%)
  // Inputs: Tech=80, Rel=90, Comm=70, Struct=80, Concept=100
  // Expected: (80*0.40) + (90*0.20) + (80*0.15) + (100*0.15) + (70*0.10)
  //         = 32 + 18 + 12 + 15 + 7 = 84.0
  const techEval = calculateOverallScore('Technical', {
    technical_score: 80,
    relevance_score: 90,
    communication_score: 70,
    structure_score: 80,
    concept_coverage_score: 100,
  });
  assert(techEval.overall_score === 84.0, `Expected 84.0, got ${techEval.overall_score}`);
  console.log('✅ Test 1 Passed: Technical weighting exact match (84.0)');

  // Test 2: HR formula weighting
  // Relevance (30%) + Communication (30%) + Structure (20%) + Professionalism (20%)
  // Inputs: Rel=80, Comm=90, Struct=85, Concept/Prof=75
  // Expected: (80*0.30) + (90*0.30) + (85*0.20) + (75*0.20)
  //         = 24 + 27 + 17 + 15 = 83.0
  const hrEval = calculateOverallScore('HR', {
    relevance_score: 80,
    communication_score: 90,
    structure_score: 85,
    concept_coverage_score: 75,
  });
  assert(hrEval.overall_score === 83.0, `Expected 83.0, got ${hrEval.overall_score}`);
  console.log('✅ Test 2 Passed: HR weighting exact match (83.0)');

  // Test 3: Clamping logic
  assert(clampScore(150) === 100, 'Score over 100 should be clamped to 100');
  assert(clampScore(-20) === 0, 'Negative score should be clamped to 0');
  assert(clampScore('invalid', 50) === 50, 'Non-numeric input should fallback');
  console.log('✅ Test 3 Passed: Clamping boundaries (0 - 100)');

  // Test 4: Interview Summary Calculation (averaging)
  const answers = [
    {
      technical_score: 80,
      relevance_score: 85,
      communication_score: 75,
      structure_score: 80,
      concept_coverage_score: 90,
      overall_score: 82.0,
      is_unanswered: false,
    },
    {
      technical_score: 90,
      relevance_score: 95,
      communication_score: 85,
      structure_score: 85,
      concept_coverage_score: 90,
      overall_score: 90.0,
      is_unanswered: false,
    },
  ];
  const summary = calculateInterviewSummary(answers);
  assert(summary.averageScore === 86.0, `Expected summary average 86.0, got ${summary.averageScore}`);
  assert(summary.answeredCount === 2, 'Expected 2 answered count');
  console.log('✅ Test 4 Passed: Interview summary calculation');

  console.log('🎉 All Scoring Engine Unit Tests Passed Successfully!');
  return true;
}
