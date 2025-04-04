export const compareString = (val1: string | null | undefined, val2: string | null | undefined): number => {
    if (!val1 || !val2) {
        return 0;
    }
    return val1.trim().toLowerCase() === val2.trim().toLowerCase() ? 1.0 : 0.0;
};

export const compareBoolean = (val1: boolean, val2: boolean): number => {
    return val1 === val2 ? 1.0 : 0.0;
};

export const numericMatch = (val1: number, val2: number): number => {
    const diff = Math.abs(val1 - val2);
    if (diff === 0) {
        return 1.0;
    } else if (diff === 1) {
        return 0.9;
    } else if (diff === 2) {
        return 0.8;
    } else if (diff <= 3) {
        return 0.6;
    } else {
        return 0.3;
    }
};

export const traitOverlapScore = (user1Traits: string[], user2TopTraits: string[]): number => {
    const overlap = new Set(user1Traits.filter(trait => user2TopTraits.includes(trait)));
    return overlap.size / 3.0;
};

export const hasDealbreakerConflict = (user1: Record<string, any>, user2: Record<string, any>): boolean => {
    const db1 = user1.deal_breakers || [];
    const db2 = user2.deal_breakers || [];
    
    const user2Values = Object.values(user2).join(' ').toLowerCase();
    const user1Values = Object.values(user1).join(' ').toLowerCase();
    
    return db1.some((term: string) => user2Values.includes(term.toLowerCase())) ||
           db2.some((term: string) => user1Values.includes(term.toLowerCase()));
};

export const calculateFinalScore = (scoreBreakdown: Record<string, number>, archetypeScore: number): number => {
    const traitTotal = Object.values(scoreBreakdown).reduce((sum, score) => sum + score, 0);
    const finalScore = 0.6 * traitTotal + 0.4 * archetypeScore * 100;
    return Number(finalScore.toFixed(2));
};

// Matching pairs
export const cognitiveStylePairs: Record<string, Record<string, number>> = {
    "Logical": { "Logical": 1.0, "Practical": 0.9, "Emotional": 0.6, "Abstract": 0.7 },
    "Emotional": { "Emotional": 1.0, "Abstract": 0.9, "Logical": 0.6, "Practical": 0.7 },
    "Practical": { "Practical": 1.0, "Logical": 0.9, "Abstract": 0.8, "Emotional": 0.7 },
    "Abstract": { "Abstract": 1.0, "Emotional": 0.9, "Practical": 0.8, "Logical": 0.7 }
};

export const conflictPairs: Record<string, Record<string, number>> = {
    "Engages": { "Withdraws": 0.9, "Reframes": 1.0, "Shuts Down": 0.0 },
    "Withdraws": { "Engages": 0.9, "Reframes": 1.0, "Shuts Down": 0.0 },
    "Reframes": { "Engages": 1.0, "Withdraws": 1.0, "Shuts Down": 0.7, "None": 1.0 },
    "Shuts Down": { "Engages": 0.0, "Withdraws": 0.0, "Reframes": 0.7, "Shuts Down": 0.0 }
};

export const loveLanguagePairs: Record<string, Record<string, number>> = {
    "Words": { "Words": 1.0, "Time": 0.9, "Gifts": 0.7, "Touch": 0.6 },
    "Touch": { "Touch": 1.0, "Acts": 0.9, "Gifts": 0.7, "Words": 0.6 },
    "Acts": { "Acts": 1.0, "Touch": 0.9 },
    "Gifts": { "Gifts": 1.0, "None": 0.8, "Words": 0.7, "Touch": 0.7 },
    "Time": { "Time": 1.0, "Words": 0.9 }
};

export const stressCopingPairs: Record<string, Record<string, number>> = {
    "Alone Time": { "Alone Time": 1.0, "Distracts Self": 0.8, "Seeks Connection": 0.6 },
    "Seeks Connection": { "Seeks Connection": 1.0, "Over-functions": 0.8, "Alone Time": 0.6 },
    "Distracts Self": { "Distracts Self": 1.0, "Alone Time": 0.8, "Over-functions": 0.6 },
    "Over-functions": { "Over-functions": 1.0, "Seeks Connection": 0.8, "Distracts Self": 0.6 }
};

export const homebodyMatch: Record<string, Record<string, number>> = {
    "Homebody": { "Homebody": 1.0, "Socialite": 0.5 },
    "Socialite": { "Socialite": 1.0 },
    "Balanced": { "None": 0.9 }
};

export const careerMatch: Record<string, Record<string, number>> = {
    "Ambitious": { "Ambitious": 1.0, "Balanced": 0.8, "Flexible": 0.6 },
    "Balanced": { "Balanced": 1.0, "Flexible": 0.8 },
    "Flexible": { "Flexible": 1.0 }
};

export const sleepMatch: Record<string, Record<string, number>> = {
    "Early Bird": { "Early Bird": 1.0, "Night Owl": 0.6 },
    "Night Owl": { "Night Owl": 1.0 },
    "Mid-range": { "None": 0.9 }
};

export const attachmentStylePairs: Record<string, Record<string, number>> = {
    "Secure": { "Secure": 1.0, "Anxious": 0.8, "Fearful": 0.6, "Avoidant": 0.5 },
    "Avoidant": { "Avoidant": 1.0, "Fearful": 0.8, "Anxious": 0.6, "Secure": 0.5 },
    "Anxious": { "Anxious": 1.0, "Secure": 0.8, "Avoidant": 0.6, "Fearful": 0.5 },
    "Fearful": { "Fearful": 1.0, "Avoidant": 0.8, "Secure": 0.6, "Anxious": 0.5 }
};

// Additional matching functions
export const personalityMatch = (val1: string | null | undefined, val2: string | null | undefined): number => {
    if (!val1 || !val2) {
        return 0;
    }
    if (val1.trim().toLowerCase() === val2.trim().toLowerCase()) {
        return 1.0;
    }
    return val1.split(' ')[0] === val2.split(' ')[0] ? 0.7 : 0.4;
};

export const emotionalTraitsMatch = (val1: string | null | undefined, val2: string | null | undefined): number => {
    if (!val1 || !val2) {
        return 0;
    }
    const words1 = new Set(val1.toLowerCase().split(' '));
    const words2 = new Set(val2.toLowerCase().split(' '));
    const sharedWords = new Set([...words1].filter(word => words2.has(word)));
    const maxLength = Math.max(words1.size, words2.size);
    return maxLength > 0 ? sharedWords.size / maxLength : 0;
};

export const dietaryPreferencesMatch = (val1: string | null | undefined, val2: string | null | undefined): number => {
    if (!val1 || !val2) {
        return 0;
    }
    const val1Lower = val1.toLowerCase();
    const val2Lower = val2.toLowerCase();
    
    if (val1Lower === val2Lower) {
        return 1.0;
    }
    if ((val1Lower.includes('vegan') && val2Lower.includes('carnivore')) ||
        (val1Lower.includes('carnivore') && val2Lower.includes('vegan'))) {
        return 0.3;
    }
    return 0.7;
};

export const narrativeBasedMatch = (val1: string | null | undefined, val2: string | null | undefined): number => {
    return 0;
};

export const windfallMatch = (val1: string | null | undefined, val2: string | null | undefined): number => {
    if (!val1 || !val2) {
        return 0;
    }
    return val1.split(' ')[0] === val2.split(' ')[0] ? 0.7 : 0.4;
};

export const growthVisionMatch = (val1: string | null | undefined, val2: string | null | undefined): number => {
    return 0;
};

export const intimacyStyleMatch = (val1: string | null | undefined, val2: string | null | undefined): number => {
    if (!val1 || !val2) {
        return 0;
    }
    const val1Lower = val1.toLowerCase();
    const val2Lower = val2.toLowerCase();
    
    if (val1Lower === val2Lower) {
        return 1.0;
    }
    if ((val1Lower.includes('playful') && val2Lower.includes('passionate')) ||
        (val1Lower.includes('passionate') && val2Lower.includes('playful'))) {
        return 0.9;
    }
    if ((val1Lower.includes('reserved') && val2Lower.includes('sensual')) ||
        (val1Lower.includes('sensual') && val2Lower.includes('reserved'))) {
        return 0.9;
    }
    return 0.6;
};

// Archetype matrix
export const PRIMARY_MATRIX: Record<string, Record<string, number>> = {
    "The Seeker": {
        "The Seeker": 1.0,
        "The Nurturer": 1.0,
        "The Loyalist": 0.7,
        "The Challenger": 0.6,
        "The Mystic": 0.6,
        "The Architect": 0.5,
        "The Explorer": 0.8,
        "The Healer": 0.9
    },
    "The Nurturer": {
        "The Seeker": 1.0,
        "The Nurturer": 1.0,
        "The Loyalist": 0.9,
        "The Challenger": 0.7,
        "The Mystic": 0.8,
        "The Architect": 0.6,
        "The Explorer": 0.9,
        "The Healer": 1.0
    },
    "The Loyalist": {
        "The Seeker": 0.7,
        "The Nurturer": 0.9,
        "The Loyalist": 1.0,
        "The Challenger": 0.8,
        "The Mystic": 0.5,
        "The Architect": 0.7,
        "The Explorer": 0.6,
        "The Healer": 0.8
    },
    "The Challenger": {
        "The Seeker": 0.6,
        "The Nurturer": 0.7,
        "The Loyalist": 0.8,
        "The Challenger": 1.0,
        "The Mystic": 0.4,
        "The Architect": 0.9,
        "The Explorer": 0.7,
        "The Healer": 0.6
    },
    "The Mystic": {
        "The Seeker": 0.6,
        "The Nurturer": 0.8,
        "The Loyalist": 0.5,
        "The Challenger": 0.4,
        "The Mystic": 1.0,
        "The Architect": 0.4,
        "The Explorer": 0.7,
        "The Healer": 0.7
    },
    "The Architect": {
        "The Seeker": 0.5,
        "The Nurturer": 0.6,
        "The Loyalist": 0.7,
        "The Challenger": 0.9,
        "The Mystic": 0.4,
        "The Architect": 1.0,
        "The Explorer": 0.6,
        "The Healer": 0.5
    },
    "The Explorer": {
        "The Seeker": 0.8,
        "The Nurturer": 0.9,
        "The Loyalist": 0.6,
        "The Challenger": 0.7,
        "The Mystic": 0.7,
        "The Architect": 0.6,
        "The Explorer": 1.0,
        "The Healer": 0.9
    },
    "The Healer": {
        "The Seeker": 0.9,
        "The Nurturer": 1.0,
        "The Loyalist": 0.8,
        "The Challenger": 0.6,
        "The Mystic": 0.7,
        "The Architect": 0.5,
        "The Explorer": 0.9,
        "The Healer": 1.0
    }
};

// Helper function to get score from matching pairs
const getPairScore = (pairs: Record<string, Record<string, number>>, val1: string, val2: string): number => {
    return pairs[val1]?.[val2] || pairs[val2]?.[val1] || 0;
};

// Matching functions dictionary
export const matchingFunctions: Record<string, (val1: any, val2: any) => number> = {
    "personality": personalityMatch,
    "emotional_traits": emotionalTraitsMatch,
    "cognitive_style": (val1, val2) => getPairScore(cognitiveStylePairs, val1, val2),
    "conflict_response_style": (val1, val2) => getPairScore(conflictPairs, val1, val2),
    "love_language": (val1, val2) => getPairScore(loveLanguagePairs, val1, val2),
    "stress_coping": (val1, val2) => getPairScore(stressCopingPairs, val1, val2),
    "homebody_vs_socialite": (val1, val2) => getPairScore(homebodyMatch, val1, val2),
    "career_ambition": (val1, val2) => getPairScore(careerMatch, val1, val2),
    "sleep_chronotype": (val1, val2) => getPairScore(sleepMatch, val1, val2),
    "dietary_preferences": dietaryPreferencesMatch,
    "past_relationship_struggles": narrativeBasedMatch,
    "shadow_side": narrativeBasedMatch,
    "preferred_date_spots": narrativeBasedMatch,
    "unexpected_windfall": windfallMatch,
    "dating_difficulty": narrativeBasedMatch,
    "personal_growth_vision": growthVisionMatch,
    "relationship_goals": compareString,
    "monogamy_vs_polyamory": compareString,
    "relocation_willingness": compareBoolean,
    "parenting_aspirations": compareString,
    "political_alignment": compareString,
    "religious_compatibility": compareString,
    "love_vs_lust_priority": compareString,
    "love_pace_preference": compareString,
    "long_distance_tolerance": compareBoolean,
    "household_roles": compareString,
    "financial_approach": compareString,
    "physical_touch_comfort": numericMatch,
    "fitness_level": compareString,
    "financial_mindset": compareString,
    "adventure_vs_stability": compareString,
    "family_social_importance": compareString,
    "gender": compareString,
    "pet_preference": compareString,
    "work_life_balance": compareString,
    "ideal_partner_traits": traitOverlapScore,
    "attachment_style": (val1, val2) => getPairScore(attachmentStylePairs, val1, val2),
    "intimacy_style": intimacyStyleMatch,
    "religion_importance": compareBoolean,
    "career_drive": compareString,
    "financial_alignment": compareString,
    "cultural_identity": compareString,
    "flexibility_score": numericMatch,
    "emotional_intensity_score": numericMatch,
    "sexual_openness": numericMatch,
    "intimacy_importance": numericMatch,
    "pda_comfort_level": numericMatch,
    "intellectual_compatibility": numericMatch,
    "social_style": compareString,
    "lifestyle_pace": compareString,
    "substance_boundary": compareString,
    "education_level": compareString,
    "dealbreakers": compareString,
    "top_partner_trait(s)": traitOverlapScore
};

export const calculateArchetypeScore = (
    user1Primary: string,
    user1Secondary: string,
    user2Primary: string,
    user2Secondary: string
): number => {
    const primaryScore = PRIMARY_MATRIX[user1Primary]?.[user2Primary] || 0;
    const secondaryScore = PRIMARY_MATRIX[user1Secondary]?.[user2Secondary] || 0;
    return 0.75 * primaryScore + 0.25 * secondaryScore;
};

interface UserProfile {
    primary_archetype: string;
    secondary_archetype: string;
    [key: string]: any;
}

// Trait category weights
export const traitCategoryWeights: Record<string, number> = {
    "core_personality": 1.2,  // Personality, emotional traits, cognitive style
    "relationship_dynamics": 1.1,  // Conflict response, love language, attachment style
    "lifestyle": 1.0,  // Homebody/socialite, career, sleep, dietary preferences
    "values": 1.0,  // Political, religious, family importance
    "intimacy": 0.9,  // Intimacy style, physical touch, PDA
    "practical": 0.8,  // Financial, household roles, work-life balance
    "preferences": 0.7  // Pet preference, substance boundaries, etc.
};

// Trait to category mapping
export const traitCategories: Record<string, string> = {
    "personality": "core_personality",
    "emotional_traits": "core_personality",
    "cognitive_style": "core_personality",
    "conflict_response_style": "relationship_dynamics",
    "love_language": "relationship_dynamics",
    "attachment_style": "relationship_dynamics",
    "homebody_vs_socialite": "lifestyle",
    "career_ambition": "lifestyle",
    "sleep_chronotype": "lifestyle",
    "dietary_preferences": "lifestyle",
    "political_alignment": "values",
    "religious_compatibility": "values",
    "family_social_importance": "values",
    "intimacy_style": "intimacy",
    "physical_touch_comfort": "intimacy",
    "pda_comfort_level": "intimacy",
    "financial_approach": "practical",
    "household_roles": "practical",
    "work_life_balance": "practical",
    "pet_preference": "preferences",
    "substance_boundary": "preferences"
};

// Validation functions
const validateArchetype = (archetype: string): boolean => {
    return Object.keys(PRIMARY_MATRIX).includes(archetype);
};

const validateTraitValue = (trait: string, value: any): boolean => {
    switch (trait) {
        case "personality":
        case "emotional_traits":
        case "cognitive_style":
        case "conflict_response_style":
        case "love_language":
        case "stress_coping":
        case "homebody_vs_socialite":
        case "career_ambition":
        case "sleep_chronotype":
        case "attachment_style":
        case "intimacy_style":
            return typeof value === "string";
        case "relocation_willingness":
        case "long_distance_tolerance":
        case "religion_importance":
            return typeof value === "boolean";
        case "physical_touch_comfort":
        case "flexibility_score":
        case "emotional_intensity_score":
        case "sexual_openness":
        case "intimacy_importance":
        case "pda_comfort_level":
        case "intellectual_compatibility":
            return typeof value === "number" && value >= 0 && value <= 10;
        default:
            return true;
    }
};

// Updated main matching function with weights and validation
export const calculateCompatibilityScore = (
    user1: UserProfile,
    user2: UserProfile
): { score: number; breakdown: Record<string, number>; errors: string[] } => {
    const errors: string[] = [];

    // Validate archetypes
    if (!validateArchetype(user1.primary_archetype)) {
        errors.push(`Invalid primary archetype for user1: ${user1.primary_archetype}`);
    }
    if (!validateArchetype(user1.secondary_archetype)) {
        errors.push(`Invalid secondary archetype for user1: ${user1.secondary_archetype}`);
    }
    if (!validateArchetype(user2.primary_archetype)) {
        errors.push(`Invalid primary archetype for user2: ${user2.primary_archetype}`);
    }
    if (!validateArchetype(user2.secondary_archetype)) {
        errors.push(`Invalid secondary archetype for user2: ${user2.secondary_archetype}`);
    }

    // Check for dealbreaker conflicts first
    if (hasDealbreakerConflict(user1, user2)) {
        return { score: 0, breakdown: {}, errors };
    }

    // Calculate archetype score
    const archetypeScore = calculateArchetypeScore(
        user1.primary_archetype,
        user1.secondary_archetype,
        user2.primary_archetype,
        user2.secondary_archetype
    );

    // Calculate trait scores with weights
    const scoreBreakdown: Record<string, number> = {};
    const categoryScores: Record<string, { total: number; count: number }> = {};
    
    // Initialize category scores
    Object.values(traitCategories).forEach(category => {
        categoryScores[category] = { total: 0, count: 0 };
    });

    // Calculate scores for each matching function
    for (const [trait, matchFunction] of Object.entries(matchingFunctions)) {
        const user1Value = user1[trait];
        const user2Value = user2[trait];
        
        if (user1Value !== undefined && user2Value !== undefined) {
            // Validate trait values
            if (!validateTraitValue(trait, user1Value)) {
                errors.push(`Invalid value for user1 ${trait}: ${user1Value}`);
                continue;
            }
            if (!validateTraitValue(trait, user2Value)) {
                errors.push(`Invalid value for user2 ${trait}: ${user2Value}`);
                continue;
            }

            const rawScore = matchFunction(user1Value, user2Value);
            const category = traitCategories[trait] || "preferences";
            const weight = traitCategoryWeights[category] || 1.0;
            
            scoreBreakdown[trait] = rawScore;
            categoryScores[category].total += rawScore * weight;
            categoryScores[category].count += 1;
        }
    }

    // Calculate weighted average for each category
    const weightedScores: Record<string, number> = {};
    for (const [category, { total, count }] of Object.entries(categoryScores)) {
        if (count > 0) {
            weightedScores[category] = total / count;
        }
    }

    // Calculate final score with category weights
    const categoryWeightSum = Object.values(traitCategoryWeights).reduce((sum, weight) => sum + weight, 0);
    const weightedScoreSum = Object.entries(weightedScores).reduce(
        (sum, [category, score]) => sum + (score * (traitCategoryWeights[category] || 1.0)),
        0
    );

    const finalScore = (weightedScoreSum / categoryWeightSum) * 100;

    return {
        score: Number(finalScore.toFixed(2)),
        breakdown: {
            ...scoreBreakdown,
            ...weightedScores,
            archetype_score: archetypeScore
        },
        errors
    };
}; 