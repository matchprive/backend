import { PROMPT_TEXT } from './promptText';
import { validateResponses } from './responseProcessor';

// Archetype definitions
export const ARCHETYPES = {
    SEEKER: {
        name: 'The Seeker',
        description: 'Driven by purpose and meaning, seeks deep connections and personal growth',
        indicators: [
            'values personal growth highly',
            'seeks meaningful conversations',
            'interested in spirituality or philosophy',
            'enjoys exploring new ideas',
            'values authenticity and depth'
        ],
        questions: [
            'How important is personal growth to you?',
            'Do you enjoy deep, philosophical conversations?',
            'Are you drawn to spiritual or existential questions?',
            'How do you feel about exploring new ideas together?',
            'What does authenticity mean to you?'
        ],
        weights: {
            growthImportance: 1.2,
            emotionalIntimacy: 1.1,
            successDefinition: 1.0,
            relationshipGoal: 0.9,
            balancePreference: 0.8
        }
    },
    NURTURER: {
        name: 'The Nurturer',
        description: 'Naturally caring and supportive, creates emotional safety and stability',
        indicators: [
            'highly empathetic',
            'enjoys taking care of others',
            'creates emotional safety',
            'values harmony and connection',
            'good at emotional support'
        ],
        questions: [
            'How do you typically support others emotionally?',
            'What does emotional safety mean to you?',
            'How important is harmony in relationships?',
            'Do you enjoy taking care of others?',
            'How do you handle others\' emotions?'
        ],
        weights: {
            emotionalOpennessScale: 1.2,
            affectionStyle: 1.1,
            emotionalAvailability: 1.0,
            forgivenessStyle: 0.9,
            familyImportance: 0.8
        }
    },
    PROTECTOR: {
        name: 'The Protector',
        description: 'Strong and reliable, provides security and structure in relationships',
        indicators: [
            'values security and stability',
            'takes responsibility seriously',
            'good at setting boundaries',
            'protective of loved ones',
            'creates structure and order'
        ],
        questions: [
            'How important is security in relationships?',
            'How do you handle responsibility?',
            'Are you good at setting boundaries?',
            'How protective are you of loved ones?',
            'Do you prefer structure or flexibility?'
        ],
        weights: {
            leadershipPreference: 1.2,
            careerDrive: 1.1,
            financialAmbition: 1.0,
            independencePreference: 0.9,
            publicAffection: 0.8
        }
    },
    EXPLORER: {
        name: 'The Explorer',
        description: 'Adventurous and curious, brings excitement and new experiences',
        indicators: [
            'loves adventure and new experiences',
            'spontaneous and flexible',
            'enjoys trying new things',
            'values freedom and independence',
            'brings excitement to relationships'
        ],
        questions: [
            'How adventurous are you?',
            'Do you enjoy spontaneity?',
            'How important is trying new things?',
            'What does freedom mean to you?',
            'How do you bring excitement to relationships?'
        ],
        weights: {
            adventureScale: 1.2,
            sexualExploration: 1.1,
            weekendPreference: 1.0,
            socialPreference: 0.9,
            activityLevel: 0.8
        }
    }
};

// Primary archetype compatibility matrix
export const PRIMARY_MATRIX = {
    SEEKER: {
        SEEKER: 0.8,
        NURTURER: 0.9,
        PROTECTOR: 0.7,
        EXPLORER: 0.6
    },
    NURTURER: {
        SEEKER: 0.9,
        NURTURER: 0.8,
        PROTECTOR: 0.9,
        EXPLORER: 0.7
    },
    PROTECTOR: {
        SEEKER: 0.7,
        NURTURER: 0.9,
        PROTECTOR: 0.8,
        EXPLORER: 0.6
    },
    EXPLORER: {
        SEEKER: 0.6,
        NURTURER: 0.7,
        PROTECTOR: 0.6,
        EXPLORER: 0.8
    }
};

// Calculate archetype scores based on responses
export const calculateArchetypeScores = (responses: Record<string, any>): Record<string, number> => {
    const { processed } = validateResponses(responses);
    const scores: Record<string, number> = {};

    for (const [archetype, data] of Object.entries(ARCHETYPES)) {
        let totalScore = 0;
        let totalWeight = 0;

        for (const [field, weight] of Object.entries(data.weights)) {
            const value = processed[field];
            if (value !== undefined && value !== null) {
                totalScore += value * weight;
                totalWeight += weight;
            }
        }

        scores[archetype] = totalWeight > 0 ? totalScore / totalWeight : 0;
    }

    return scores;
};

// Determine primary and secondary archetypes
export const determineArchetypes = (scores: Record<string, number>): {
    primary: string;
    secondary: string;
    scores: Record<string, number>;
} => {
    const sorted = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .map(([archetype, score]) => ({ archetype, score }));

    return {
        primary: sorted[0].archetype,
        secondary: sorted[1].archetype,
        scores: Object.fromEntries(sorted.map(({ archetype, score }) => [archetype, score]))
    };
};

// Calculate archetype compatibility score
export const calculateArchetypeCompatibility = (
    user1Archetypes: { primary: string; secondary: string },
    user2Archetypes: { primary: string; secondary: string }
): number => {
    const primaryScore = PRIMARY_MATRIX[user1Archetypes.primary as keyof typeof PRIMARY_MATRIX][user2Archetypes.primary as keyof typeof PRIMARY_MATRIX];
    const secondaryScore = PRIMARY_MATRIX[user1Archetypes.secondary as keyof typeof PRIMARY_MATRIX][user2Archetypes.secondary as keyof typeof PRIMARY_MATRIX];

    return (primaryScore * 0.75) + (secondaryScore * 0.25);
};

// Get archetype insights
export const getArchetypeInsights = (archetype: string): {
    strengths: string[];
    challenges: string[];
    idealMatches: string[];
    growthAreas: string[];
} => {
    const data = ARCHETYPES[archetype as keyof typeof ARCHETYPES];
    if (!data) return { strengths: [], challenges: [], idealMatches: [], growthAreas: [] };

    return {
        strengths: [
            'Natural ' + data.description.split(',')[0],
            'Strong in ' + data.indicators[0],
            'Excels at ' + data.indicators[1]
        ],
        challenges: [
            'May need to balance ' + data.indicators[0] + ' with self-care',
            'Could work on ' + data.indicators[3] + ' in moderation',
            'Should be mindful of ' + data.indicators[4]
        ],
        idealMatches: Object.entries(PRIMARY_MATRIX[archetype as keyof typeof PRIMARY_MATRIX])
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([match]) => ARCHETYPES[match as keyof typeof ARCHETYPES].name),
        growthAreas: [
            'Developing ' + data.indicators[2],
            'Enhancing ' + data.indicators[1],
            'Balancing ' + data.indicators[0] + ' with other needs'
        ]
    };
}; 