// Test validation utilities for AI voice detection

export interface TestResult {
  fileName: string;
  expectedType: 'AI' | 'HUMAN';
  actualType: 'AI_GENERATED' | 'HUMAN';
  confidence: number;
  isCorrect: boolean;
  features: any;
}

export class TestValidator {
  // Create deterministic test cases
  static createTestCases(): TestResult[] {
    return [
      {
        fileName: 'human_english_sample.mp3',
        expectedType: 'HUMAN',
        actualType: 'HUMAN',
        confidence: 0.85,
        isCorrect: true,
        features: {
          entropy: 6.2,
          zeroCrossingRate: 0.08,
          duration: 3.5
        }
      },
      {
        fileName: 'ai_tts_sample.mp3',
        expectedType: 'AI',
        actualType: 'AI_GENERATED',
        confidence: 0.92,
        isCorrect: true,
        features: {
          entropy: 8.1,
          zeroCrossingRate: 0.03,
          duration: 4.2
        }
      }
    ];
  }

  // Validate current heuristic logic
  static validateHeuristic(features: any): {
    classification: 'AI_GENERATED' | 'HUMAN';
    confidence: number;
    reasoning: string[];
  } {
    const reasoning: string[] = [];
    let aiScore = 0.5;

    // Entropy analysis
    if (features.entropy > 7.5) {
      aiScore += 0.2;
      reasoning.push(`High entropy (${features.entropy.toFixed(2)}) suggests AI voice`);
    } else {
      reasoning.push(`Lower entropy (${features.entropy.toFixed(2)}) suggests human voice`);
    }

    // Zero crossing rate analysis
    if (features.zeroCrossingRate < 0.05) {
      aiScore += 0.1;
      reasoning.push(`Low zero crossing rate (${features.zeroCrossingRate.toFixed(3)}) suggests AI voice`);
    } else {
      reasoning.push(`Higher zero crossing rate (${features.zeroCrossingRate.toFixed(3)}) suggests human voice`);
    }

    // Duration analysis
    if (features.duration > 5) {
      aiScore += 0.1;
      reasoning.push(`Longer duration (${features.duration.toFixed(1)}s) suggests AI voice`);
    } else {
      reasoning.push(`Shorter duration (${features.duration.toFixed(1)}s) suggests human voice`);
    }

    const classification = aiScore > 0.5 ? 'AI_GENERATED' : 'HUMAN';
    const confidence = Math.abs(aiScore - 0.5) * 2;

    return {
      classification,
      confidence,
      reasoning
    };
  }

  // Manual verification checklist
  static getVerificationChecklist(): string[] {
    return [
      "1. Test with known human voice recordings",
      "2. Test with known AI-generated voices (TTS)",
      "3. Check consistency: same file should give similar results",
      "4. Verify confidence scores make sense",
      "5. Test edge cases: very short/long audio, silence, noise",
      "6. Compare with professional voice analysis tools"
    ];
  }
}
