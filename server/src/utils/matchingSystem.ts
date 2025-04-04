import { validateResponses } from './responseProcessor';
import { 
    calculateArchetypeScores, 
    determineArchetypes, 
    calculateArchetypeCompatibility, 
    getArchetypeInsights,
    ARCHETYPES 
} from './archetypeScorer';

// Trait category weights
export const TRAIT_CATEGORY_WEIGHTS = {
    corePersonality: 1.2,
    relationshipDynamics: 1.1,
    lifestyle: 1.0,
    values: 1.0,
    intimacy: 0.9,
    practicalMatters: 0.8,
    preferences: 0.7
};

// Trait to category mapping
export const TRAIT_CATEGORIES = {
    // Core Personality
    relationshipStyle: 'corePersonality',
    logicIntuitionScale: 'corePersonality',
    emotionalOpennessScale: 'corePersonality',
    leadershipPreference: 'corePersonality',
    shadowTrait: 'corePersonality',

    // Relationship Dynamics
    emotionalAvailability: 'relationshipDynamics',
    forgivenessStyle: 'relationshipDynamics',
    emotionalBlocks: 'relationshipDynamics',
    independencePreference: 'relationshipDynamics',
    emotionProcessing: 'relationshipDynamics',
    balancePreference: 'relationshipDynamics',

    // Lifestyle
    socialPreference: 'lifestyle',
    weekendPreference: 'lifestyle',
    sleepSchedule: 'lifestyle',
    petPreference: 'lifestyle',
    adventureScale: 'lifestyle',
    stressResponse: 'lifestyle',
    activityLevel: 'lifestyle',
    substancePreference: 'lifestyle',

    // Values
    relationshipGoal: 'values',
    affectionStyle: 'values',
    dealbreakers: 'values',
    childrenPreference: 'values',
    faithPreference: 'values',
    politicalLeaning: 'values',
    successDefinition: 'values',
    growthImportance: 'values',

    // Intimacy
    essentialConnection: 'intimacy',
    sexualExploration: 'intimacy',
    intimacyImportance: 'intimacy',
    intimacyStyle: 'intimacy',
    relationshipStructure: 'intimacy',
    publicAffection: 'intimacy',
    affectionExpression: 'intimacy',
    emotionalIntimacy: 'intimacy',

    // Practical Matters
    careerDrive: 'practicalMatters',
    financialAmbition: 'practicalMatters',
    familyImportance: 'practicalMatters',
    culturalIdentity: 'practicalMatters',

    // Preferences
    partnerTraits: 'preferences'
};

// Calculate weighted trait score
const calculateWeightedTraitScore = (value1: any, value2: any, trait: string): number => {
    if (value1 === null || value2 === null) return 0;

    const category = TRAIT_CATEGORIES[trait as keyof typeof TRAIT_CATEGORIES];
    const categoryWeight = TRAIT_CATEGORY_WEIGHTS[category as keyof typeof TRAIT_CATEGORY_WEIGHTS];

    // Handle different types of traits
    if (typeof value1 === 'number' && typeof value2 === 'number') {
        // For numeric traits (like scales)
        const diff = Math.abs(value1 - value2);
        return (1 - diff / 10) * categoryWeight;
    } else if (Array.isArray(value1) && Array.isArray(value2)) {
        // For array traits (like dealbreakers)
        const common = value1.filter(item => value2.includes(item));
        return (common.length / Math.max(value1.length, value2.length)) * categoryWeight;
    } else if (typeof value1 === 'string' && typeof value2 === 'string') {
        // For string traits
        return (value1.toLowerCase() === value2.toLowerCase() ? 1 : 0) * categoryWeight;
    }

    return 0;
};

// Calculate compatibility score between two users
export const calculateCompatibilityScore = (
    user1Responses: Record<string, any>,
    user2Responses: Record<string, any>
): {
    score: number;
    breakdown: Record<string, number>;
    archetypeCompatibility: number;
    insights: {
        user1: {
            archetype: string;
            strengths: string[];
            challenges: string[];
            idealMatches: string[];
            growthAreas: string[];
        };
        user2: {
            archetype: string;
            strengths: string[];
            challenges: string[];
            idealMatches: string[];
            growthAreas: string[];
        };
    };
} => {
    // Validate and process responses
    const { processed: processed1 } = validateResponses(user1Responses);
    const { processed: processed2 } = validateResponses(user2Responses);

    // Calculate archetype scores and determine archetypes
    const user1ArchetypeScores = calculateArchetypeScores(processed1);
    const user2ArchetypeScores = calculateArchetypeScores(processed2);

    const user1Archetypes = determineArchetypes(user1ArchetypeScores);
    const user2Archetypes = determineArchetypes(user2ArchetypeScores);

    // Calculate archetype compatibility
    const archetypeCompatibility = calculateArchetypeCompatibility(user1Archetypes, user2Archetypes);

    // Calculate trait compatibility scores
    const traitScores: Record<string, number> = {};
    let totalScore = 0;
    let totalWeight = 0;

    for (const trait in processed1) {
        if (trait in processed2) {
            const score = calculateWeightedTraitScore(processed1[trait], processed2[trait], trait);
            traitScores[trait] = score;
            totalScore += score;
            totalWeight += TRAIT_CATEGORY_WEIGHTS[TRAIT_CATEGORIES[trait as keyof typeof TRAIT_CATEGORIES] as keyof typeof TRAIT_CATEGORY_WEIGHTS];
        }
    }

    // Calculate final score (70% traits, 30% archetypes)
    const finalScore = (totalScore / totalWeight) * 0.7 + archetypeCompatibility * 0.3;

    // Get archetype insights
    const user1Insights = getArchetypeInsights(user1Archetypes.primary);
    const user2Insights = getArchetypeInsights(user2Archetypes.primary);

    return {
        score: finalScore,
        breakdown: traitScores,
        archetypeCompatibility,
        insights: {
            user1: {
                archetype: ARCHETYPES[user1Archetypes.primary as keyof typeof ARCHETYPES].name,
                ...user1Insights
            },
            user2: {
                archetype: ARCHETYPES[user2Archetypes.primary as keyof typeof ARCHETYPES].name,
                ...user2Insights
            }
        }
    };
};

// Check for dealbreaker conflicts
export const hasDealbreakerConflicts = (
    user1Responses: Record<string, any>,
    user2Responses: Record<string, any>
): boolean => {
    const { processed: processed1 } = validateResponses(user1Responses);
    const { processed: processed2 } = validateResponses(user2Responses);

    // Check dealbreakers
    if (processed1.dealbreakers && processed2.dealbreakers) {
        const conflicts = processed1.dealbreakers.filter((dealbreaker: string) =>
            processed2.dealbreakers.includes(dealbreaker)
        );
        if (conflicts.length > 0) return true;
    }

    // Check other potential dealbreakers
    const dealbreakerPairs = [
        ['childrenPreference', 'childrenPreference'],
        ['faithPreference', 'faithPreference'],
        ['relationshipStructure', 'relationshipStructure']
    ];

    for (const [trait1, trait2] of dealbreakerPairs) {
        if (processed1[trait1] && processed2[trait2] && processed1[trait1] !== processed2[trait2]) {
            return true;
        }
    }

    return false;
}; 