import { PROMPT_TEXT } from './promptText';

// Response type definitions
export type NumericResponse = number;
export type BooleanResponse = boolean;
export type StringResponse = string;
export type ArrayResponse = string[];
export type ScaleResponse = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Validation functions
export const validateNumeric = (value: any): NumericResponse | null => {
    const num = Number(value);
    return !isNaN(num) ? num : null;
};

export const validateBoolean = (value: any): BooleanResponse | null => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (['yes', 'true', 'y', '1'].includes(lower)) return true;
        if (['no', 'false', 'n', '0'].includes(lower)) return false;
    }
    return null;
};

export const validateString = (value: any): StringResponse | null => {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
};

export const validateArray = (value: any): ArrayResponse | null => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : null;
        } catch {
            return value.split(',').map(item => item.trim());
        }
    }
    return null;
};

export const validateScale = (value: any): ScaleResponse | null => {
    const num = validateNumeric(value);
    return num !== null && num >= 1 && num <= 10 ? num as ScaleResponse : null;
};

// Processing functions
export const processNumericResponse = (value: any): NumericResponse | null => {
    const validated = validateNumeric(value);
    if (validated === null) return null;
    return Math.round(validated * 100) / 100; // Round to 2 decimal places
};

export const processBooleanResponse = (value: any): BooleanResponse | null => {
    return validateBoolean(value);
};

export const processStringResponse = (value: any): StringResponse | null => {
    return validateString(value);
};

export const processArrayResponse = (value: any): ArrayResponse | null => {
    const validated = validateArray(value);
    if (validated === null) return null;
    return validated.map(item => item.trim()).filter(item => item.length > 0);
};

export const processScaleResponse = (value: any): ScaleResponse | null => {
    return validateScale(value);
};

// Field type mapping
export const FIELD_TYPES = {
    // Basic Info
    name: 'string',
    age: 'numeric',
    gender: 'string',
    orientation: 'string',
    location: 'string',
    occupation: 'string',
    preferredLocation: 'string',
    height: 'numeric',
    bodyType: 'string',

    // Personality
    relationshipStyle: 'string',
    logicIntuitionScale: 'scale',
    emotionalOpennessScale: 'scale',
    leadershipPreference: 'string',
    shadowTrait: 'string',
    emotionalAvailability: 'string',
    forgivenessStyle: 'string',
    emotionalBlocks: 'string',
    independencePreference: 'string',
    emotionProcessing: 'string',
    balancePreference: 'string',

    // Lifestyle
    socialPreference: 'string',
    weekendPreference: 'string',
    sleepSchedule: 'string',
    petPreference: 'string',
    adventureScale: 'scale',
    stressResponse: 'string',
    activityLevel: 'string',
    substancePreference: 'string',

    // Values
    relationshipGoal: 'string',
    affectionStyle: 'string',
    dealbreakers: 'array',
    childrenPreference: 'string',
    faithPreference: 'string',
    politicalLeaning: 'string',
    careerDrive: 'scale',
    financialAmbition: 'scale',
    familyImportance: 'scale',
    culturalIdentity: 'string',
    successDefinition: 'string',
    growthImportance: 'scale',

    // Intimacy
    essentialConnection: 'string',
    sexualExploration: 'scale',
    intimacyImportance: 'scale',
    intimacyStyle: 'string',
    relationshipStructure: 'string',
    publicAffection: 'scale',
    affectionExpression: 'string',
    emotionalIntimacy: 'string',

    // Reflection
    windfallResponse: 'string',
    betrayalResponse: 'string',
    datingDifficulty: 'string',
    pastRelationship: 'string',
    growthGoal: 'string',
    therapyExperience: 'string',
    attachmentStyle: 'string',
    conflictTriggers: 'array',
    relationshipPatterns: 'array',
    conflictResponse: 'string',

    // Ideal Partner
    partnerTraits: 'array'
};

// Process response based on field type
export const processResponse = (field: string, value: any): any => {
    const type = FIELD_TYPES[field as keyof typeof FIELD_TYPES];
    if (!type) return null;

    switch (type) {
        case 'numeric':
            return processNumericResponse(value);
        case 'boolean':
            return processBooleanResponse(value);
        case 'string':
            return processStringResponse(value);
        case 'array':
            return processArrayResponse(value);
        case 'scale':
            return processScaleResponse(value);
        default:
            return null;
    }
};

// Validate all responses
export const validateResponses = (responses: Record<string, any>): {
    valid: boolean;
    errors: Record<string, string>;
    processed: Record<string, any>;
} => {
    const errors: Record<string, string> = {};
    const processed: Record<string, any> = {};

    for (const [field, value] of Object.entries(responses)) {
        const processedValue = processResponse(field, value);
        if (processedValue === null) {
            errors[field] = `Invalid response for ${field}`;
        } else {
            processed[field] = processedValue;
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
        processed
    };
}; 