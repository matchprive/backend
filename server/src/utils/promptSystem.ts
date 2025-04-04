// Response validators
export const responseValidators = {
    numeric: (value: number): boolean => value >= 1 && value <= 10,
    boolean: (value: boolean): boolean => typeof value === "boolean",
    string: (value: string): boolean => value.length > 0,
    array: (value: any[]): boolean => Array.isArray(value) && value.length > 0,
    scale: (value: number): boolean => value >= 1 && value <= 10
};

// Response processing
export const processResponse = (response: string, field: string): any => {
    if (field.includes("scale") || field.includes("score")) {
        return parseNumericResponse(response);
    }
    if (field.includes("style")) {
        return categorizeStyle(response);
    }
    if (field.includes("traits") || field.includes("preferences")) {
        return processArrayResponse(response);
    }
    return response;
};

// Archetype scoring criteria
export const archetypeScoringCriteria = {
    "The Seeker": {
        indicators: ["visionary", "growth-oriented", "spiritual", "meaning-seeking"],
        questions: [
            "What drives your personal growth?",
            "How do you handle uncertainty?",
            "What does 'spiritual connection' mean to you?",
            "How do you balance your quest for growth with relationship stability?"
        ],
        scoring: {
            "visionary": 2,
            "growth-oriented": 2,
            "spiritual": 1.5,
            "meaning-seeking": 1.5,
            "uncertainty-tolerant": 1
        }
    },
    "The Nurturer": {
        indicators: ["empathetic", "supportive", "caregiving", "emotionally available"],
        questions: [
            "How do you support others?",
            "What does emotional safety mean to you?",
            "How do you handle others' emotional needs?",
            "What's your approach to caregiving in relationships?"
        ],
        scoring: {
            "empathetic": 2,
            "supportive": 2,
            "caregiving": 1.5,
            "emotionally-available": 1.5,
            "protective": 1
        }
    },
    "The Loyalist": {
        indicators: ["dependable", "committed", "structured", "security-focused"],
        questions: [
            "How do you build trust?",
            "What does commitment mean to you?",
            "How important is stability in your relationships?",
            "How do you handle change in relationships?"
        ],
        scoring: {
            "dependable": 2,
            "committed": 2,
            "structured": 1.5,
            "security-focused": 1.5,
            "traditional": 1
        }
    },
    "The Challenger": {
        indicators: ["assertive", "boundary-setting", "direct", "growth-focused"],
        questions: [
            "How do you handle conflict?",
            "What's your approach to setting boundaries?",
            "How do you push for growth in relationships?",
            "What does healthy confrontation look like to you?"
        ],
        scoring: {
            "assertive": 2,
            "boundary-setting": 2,
            "direct": 1.5,
            "growth-focused": 1.5,
            "protective": 1
        }
    },
    "The Mystic": {
        indicators: ["intuitive", "deep", "reflective", "spiritual"],
        questions: [
            "How do you process emotions?",
            "What does deep connection mean to you?",
            "How do you explore the unseen in relationships?",
            "What role does intuition play in your connections?"
        ],
        scoring: {
            "intuitive": 2,
            "deep": 2,
            "reflective": 1.5,
            "spiritual": 1.5,
            "mysterious": 1
        }
    },
    "The Architect": {
        indicators: ["structured", "analytical", "planning", "detail-oriented"],
        questions: [
            "How do you approach relationship planning?",
            "What's your ideal relationship structure?",
            "How do you handle relationship logistics?",
            "What does organization mean to you in relationships?"
        ],
        scoring: {
            "structured": 2,
            "analytical": 2,
            "planning": 1.5,
            "detail-oriented": 1.5,
            "methodical": 1
        }
    },
    "The Explorer": {
        indicators: ["adventurous", "curious", "spontaneous", "growth-seeking"],
        questions: [
            "How do you approach new experiences?",
            "What does adventure mean to you?",
            "How do you balance stability with exploration?",
            "What role does novelty play in your relationships?"
        ],
        scoring: {
            "adventurous": 2,
            "curious": 2,
            "spontaneous": 1.5,
            "growth-seeking": 1.5,
            "flexible": 1
        }
    },
    "The Healer": {
        indicators: ["empathetic", "nurturing", "transformative", "supportive"],
        questions: [
            "How do you support healing in relationships?",
            "What does emotional transformation mean to you?",
            "How do you handle others' pain?",
            "What's your approach to relationship repair?"
        ],
        scoring: {
            "empathetic": 2,
            "nurturing": 2,
            "transformative": 1.5,
            "supportive": 1.5,
            "compassionate": 1
        }
    }
};

// Response mapping
export const responseMapping: Record<string, string> = {
    // Basic Info
    "name": "name",
    "age": "age",
    "gender": "gender",
    "location": "location",
    "preferred_partner_gender": "preferred_partner_gender",
    
    // Personality & Emotional Traits
    "personality_description": "personality",
    "emotional_openness_scale": "emotional_traits",
    "cognitive_style_scale": "cognitive_style",
    "attachment_style": "attachment_style",
    "conflict_triggers": "conflict_triggers",
    "forgiveness_style": "forgiveness_style",
    "emotional_blocks": "love_blocks",
    "betrayal_response": "handling_betrayal",
    "relationship_struggles": "past_relationship_struggles",
    "shadow_traits": "shadow_side",
    
    // Lifestyle & Daily Habits
    "interests": "interests",
    "weekend_preferences": "weekend_activities",
    "date_spot_preferences": "preferred_date_spots",
    "sleep_pattern": "sleep_chronotype",
    "work_life_balance": "work_life_balance",
    "dietary_preferences": "dietary_preferences",
    "fitness_level": "fitness_level",
    "pet_preference": "pet_preference",
    "social_preference": "homebody_vs_socialite",
    "career_ambition": "career_ambition",
    "financial_approach": "financial_approach",
    "stress_response": "stress_coping",
    "adventure_preference": "adventure_vs_stability",
    "travel_style": "travel_style",
    "lifestyle_pace": "lifestyle_pace",
    "cleanliness_preference": "cleanliness_preference",
    "social_style": "social_style",
    
    // Relationship Goals & Core Values
    "relationship_goals": "relationship_goals",
    "life_goals": "biggest_life_goal",
    "financial_mindset": "financial_mindset",
    "love_language": "love_language",
    "dealbreakers": "deal_breakers",
    "relocation_willingness": "relocation_willingness",
    "parenting_aspirations": "parenting_aspirations",
    "household_roles": "household_roles",
    "political_alignment": "political_alignment",
    "religious_compatibility": "religious_compatibility",
    "ideal_partner_traits": "ideal_partner_traits",
    "family_importance": "family_social_importance",
    "religion_importance": "religion_importance",
    "cultural_identity": "cultural_identity",
    
    // Sexual Compatibility & Intimacy
    "love_vs_lust": "love_vs_lust_priority",
    "relationship_pace": "love_pace_preference",
    "long_distance": "long_distance_tolerance",
    "relationship_structure": "monogamy_vs_polyamory",
    "physical_touch": "physical_touch_comfort",
    "romantic_gestures": "romantic_gesture_type",
    "intimacy_style": "intimacy_style",
    "sexual_openness": "sexual_openness",
    "intimacy_importance": "intimacy_importance",
    "pda_comfort": "pda_comfort_level",
    "flexibility": "flexibility_score",
    "emotional_intensity": "emotional_intensity_score",
    "intellectual_compatibility": "intellectual_compatibility"
};

// Archetype determination
export const determineArchetype = (responses: Record<string, any>): { primary: string; secondary: string } => {
    const scores: Record<string, number> = {};
    
    // Calculate scores for each archetype
    for (const [archetype, criteria] of Object.entries(archetypeScoringCriteria)) {
        let score = 0;
        
        // Check responses against indicators
        for (const [indicator, weight] of Object.entries(criteria.scoring)) {
            if (responses.personality?.toLowerCase().includes(indicator) ||
                responses.emotional_traits?.toLowerCase().includes(indicator) ||
                responses.relationship_goals?.toLowerCase().includes(indicator)) {
                score += weight;
            }
        }
        
        scores[archetype] = score;
    }
    
    // Sort and get top two archetypes
    const sortedArchetypes = Object.entries(scores)
        .sort(([,a], [,b]) => b - a)
        .map(([archetype]) => archetype);
    
    return {
        primary: sortedArchetypes[0],
        secondary: sortedArchetypes[1]
    };
};

// Helper functions
const parseNumericResponse = (response: string): number => {
    const num = parseFloat(response);
    return isNaN(num) ? 0 : Math.min(10, Math.max(1, num));
};

const categorizeStyle = (response: string): string => {
    const styles = [
        "playful", "passionate", "reserved", "sensual",
        "logical", "emotional", "practical", "abstract",
        "engages", "withdraws", "reframes", "shuts down"
    ];
    
    return styles.find(style => 
        response.toLowerCase().includes(style)
    ) || response;
};

const processArrayResponse = (response: string): string[] => {
    return response
        .split(/[,;]/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
}; 