import { UserProfile } from './fieldValidation';

// Dealbreaker conflict pairs
const conflictPairs = {
  'religion': ['atheist', 'religious'],
  'children': ['want', 'dont_want'],
  'monogamy': ['monogamous', 'polyamorous'],
  'location': ['urban', 'rural'],
  'lifestyle': ['active', 'sedentary']
};

/**
 * Check if there are any dealbreaker conflicts between two profiles
 * @param profile1 First user profile
 * @param profile2 Second user profile
 * @returns Conflict details or null if no conflicts
 */
export function hasDealbreakerConflict(profile1: UserProfile, profile2: UserProfile): string | null {
  for (const [trait, values] of Object.entries(conflictPairs)) {
    const value1 = profile1[trait];
    const value2 = profile2[trait];
    
    if (value1 && value2 && values.includes(value1) && values.includes(value2) && value1 !== value2) {
      return `${trait}: ${value1} vs ${value2}`;
    }
  }
  return null;
}

// Matching functions for different traits
export const matchingFunctions: Record<string, (profile1: UserProfile, profile2: UserProfile) => number> = {
  // Cognitive style compatibility
  cognitive_style: (profile1, profile2) => {
    const styles = ['analytical', 'intuitive', 'balanced'];
    const style1 = profile1.cognitive_style;
    const style2 = profile2.cognitive_style;
    
    if (!style1 || !style2) return 0.5;
    if (style1 === style2) return 1.0;
    if (style1 === 'balanced' || style2 === 'balanced') return 0.8;
    return 0.3;
  },

  // Communication style compatibility
  communication: (profile1, profile2) => {
    const styles = ['direct', 'indirect', 'balanced'];
    const style1 = profile1.communication;
    const style2 = profile2.communication;
    
    if (!style1 || !style2) return 0.5;
    if (style1 === style2) return 1.0;
    if (style1 === 'balanced' || style2 === 'balanced') return 0.8;
    return 0.4;
  },

  // Emotional expression compatibility
  emotional_expression: (profile1, profile2) => {
    const styles = ['expressive', 'reserved', 'balanced'];
    const style1 = profile1.emotional_expression;
    const style2 = profile2.emotional_expression;
    
    if (!style1 || !style2) return 0.5;
    if (style1 === style2) return 1.0;
    if (style1 === 'balanced' || style2 === 'balanced') return 0.8;
    return 0.4;
  },

  // Values compatibility
  values: (profile1, profile2) => {
    const values1 = profile1.values || [];
    const values2 = profile2.values || [];
    
    if (values1.length === 0 || values2.length === 0) return 0.5;
    
    const commonValues = values1.filter((v: string) => values2.includes(v));
    return commonValues.length / Math.max(values1.length, values2.length);
  },

  // Interests compatibility
  interests: (profile1, profile2) => {
    const interests1 = profile1.interests || [];
    const interests2 = profile2.interests || [];
    
    if (interests1.length === 0 || interests2.length === 0) return 0.5;
    
    const commonInterests = interests1.filter((i: string) => interests2.includes(i));
    return commonInterests.length / Math.max(interests1.length, interests2.length);
  }
};

// Archetype synergy matrix
const archetypeSynergy: Record<string, Record<string, number>> = {
  'explorer': {
    'explorer': 1.0,
    'builder': 0.6,
    'creator': 0.8,
    'nurturer': 0.4
  },
  'builder': {
    'explorer': 0.6,
    'builder': 1.0,
    'creator': 0.7,
    'nurturer': 0.8
  },
  'creator': {
    'explorer': 0.8,
    'builder': 0.7,
    'creator': 1.0,
    'nurturer': 0.5
  },
  'nurturer': {
    'explorer': 0.4,
    'builder': 0.8,
    'creator': 0.5,
    'nurturer': 1.0
  }
};

/**
 * Calculate archetype compatibility score
 * @param profile1 First user profile
 * @param profile2 Second user profile
 * @returns Archetype compatibility score
 */
export function calculateArchetypeScore(profile1: UserProfile, profile2: UserProfile): number {
  const archetype1 = profile1.archetype;
  const archetype2 = profile2.archetype;
  
  if (!archetype1 || !archetype2) return 0.5;
  
  return archetypeSynergy[archetype1]?.[archetype2] || 0.5;
}

/**
 * Calculate final compatibility score
 * @param traitScores Individual trait compatibility scores
 * @param archetypeScore Archetype compatibility score
 * @returns Final compatibility score
 */
export function calculateFinalScore(
  traitScores: Record<string, number>,
  archetypeScore: number
): number {
  // Weight for each component
  const weights = {
    traits: 0.7,
    archetype: 0.3
  };
  
  // Calculate average trait score
  const traitScore = Object.values(traitScores).reduce((sum, score) => sum + score, 0) / 
                    Object.keys(traitScores).length;
  
  // Calculate weighted final score
  return (traitScore * weights.traits) + (archetypeScore * weights.archetype);
} 