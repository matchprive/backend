interface UserProfile {
  name: string;
  age: number;
  gender: string;
  location: string;
  bio: string;
  photos: string[];
  preferences: {
    minAge: number;
    maxAge: number;
    gender: string[];
    distance: number;
  };
  traits: {
    personality: string[];
    lifestyle: string[];
    values: string[];
  };
  goals: {
    relationshipType: string;
    timeline: string;
    dealbreakers: string[];
  };
}

export function calculateFinalScore(user1: { profile: UserProfile }, user2: { profile: UserProfile }): number {
  const traitScores = calculateArchetypeScore(user1, user2);
  const totalScore = Object.values(traitScores).reduce((sum, score) => sum + score, 0);
  return totalScore / Object.keys(traitScores).length;
}

export function calculateArchetypeScore(user1: { profile: UserProfile }, user2: { profile: UserProfile }): { [key: string]: number } {
  const traitScores: { [key: string]: number } = {};
  
  for (const [trait, fn] of Object.entries(matchingFunctions)) {
    traitScores[trait] = fn(user1, user2);
  }
  
  return traitScores;
}

export const matchingFunctions: { [key: string]: (user1: { profile: UserProfile }, user2: { profile: UserProfile }) => number } = {
  traits: (user1, user2) => {
    const user1Traits = new Set([...user1.profile.traits.personality, ...user1.profile.traits.lifestyle, ...user1.profile.traits.values]);
    const user2Traits = new Set([...user2.profile.traits.personality, ...user2.profile.traits.lifestyle, ...user2.profile.traits.values]);
    const commonTraits = new Set([...user1Traits].filter(trait => user2Traits.has(trait)));
    return commonTraits.size / Math.max(user1Traits.size, user2Traits.size);
  },
  preferences: (user1, user2) => {
    let score = 0;
    const totalChecks = 3; // age, gender, distance

    // Age compatibility
    if (user1.profile.age >= user2.profile.preferences.minAge && user1.profile.age <= user2.profile.preferences.maxAge &&
        user2.profile.age >= user1.profile.preferences.minAge && user2.profile.age <= user1.profile.preferences.maxAge) {
      score += 1;
    }

    // Gender compatibility
    if (user1.profile.preferences.gender.includes(user2.profile.gender) && user2.profile.preferences.gender.includes(user1.profile.gender)) {
      score += 1;
    }

    // Distance compatibility (assuming same location means 100% match)
    if (user1.profile.location === user2.profile.location) {
      score += 1;
    }

    return score / totalChecks;
  },
  goals: (user1, user2) => {
    let score = 0;
    const totalChecks = 2; // type and timeline

    // Relationship type compatibility
    if (user1.profile.goals.relationshipType === user2.profile.goals.relationshipType) {
      score += 1;
    }

    // Timeline compatibility
    if (user1.profile.goals.timeline === user2.profile.goals.timeline) {
      score += 1;
    }

    return score / totalChecks;
  }
};

export function hasDealbreakerConflict(user1: { profile: UserProfile }, user2: { profile: UserProfile }): boolean {
  const user1Dealbreakers = new Set(user1.profile.goals.dealbreakers);
  const user2Dealbreakers = new Set(user2.profile.goals.dealbreakers);
  
  // Check if any of user1's dealbreakers are in user2's traits
  for (const trait of [...user2.profile.traits.personality, ...user2.profile.traits.lifestyle, ...user2.profile.traits.values]) {
    if (user1Dealbreakers.has(trait)) {
      return true;
    }
  }
  
  // Check if any of user2's dealbreakers are in user1's traits
  for (const trait of [...user1.profile.traits.personality, ...user1.profile.traits.lifestyle, ...user1.profile.traits.values]) {
    if (user2Dealbreakers.has(trait)) {
      return true;
    }
  }
  
  return false;
}

export function calculateTraitScore(user1: { profile: UserProfile }, user2: { profile: UserProfile }): number {
    return matchingFunctions.traits(user1, user2);
}

export function calculateGoalScore(user1: { profile: UserProfile }, user2: { profile: UserProfile }): number {
    return matchingFunctions.goals(user1, user2);
} 