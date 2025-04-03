// Required fields for user profile completion
export const REQUIRED_FIELDS = [
    "name",
    "age",
    "gender",
    "location",
    "preferred_partner_gender",
    "personality",
    "emotional_traits",
    "cognitive_style",
    "attachment_style",
    "conflict_triggers",
    "forgiveness_style",
    "love_blocks",
    "handling_betrayal",
    "interests",
    "weekend_activities",
    "preferred_date_spots",
    "sleep_chronotype",
    "work_life_balance",
    "dietary_preferences",
    "fitness_level",
    "pet_preference",
    "homebody_vs_socialite",
    "career_ambition",
    "financial_approach",
    "stress_coping",
    "adventure_vs_stability",
    "relationship_goals",
    "biggest_life_goal",
    "financial_mindset",
    "love_language",
    "deal_breakers",
    "relocation_willingness",
    "parenting_aspirations",
    "household_roles",
    "political_alignment",
    "religious_compatibility",
    "love_vs_lust_priority",
    "love_pace_preference",
    "long_distance_tolerance",
    "monogamy_vs_polyamory",
    "physical_touch_comfort",
    "romantic_gesture_type",
    "unexpected_windfall",
    "dating_difficulty",
    "past_relationship_lessons",
    "self_growth_goal",
    "therapy_experience",
    "attachment_awareness",
    "emotional_triggers",
    "recurring_relationship_patterns",
    "conflict_response_style",
    "ideal_partner_traits",
    "education_level",
    "visa_status",
    "career_drive",
    "intellectual_compatibility",
    "relocation_openness",
    "outlook_on_love",
    "primary_archetype",
    "secondary_archetype"
] as const;

// Type for the required fields
export type RequiredField = typeof REQUIRED_FIELDS[number];

// Interface for user profile
export interface UserProfile {
    [key: string]: any;
}

/**
 * Get list of missing required fields from a user profile
 * @param profile User profile object
 * @returns Array of missing field names
 */
export function getMissingFields(profile: UserProfile): RequiredField[] {
    return REQUIRED_FIELDS.filter(field => !profile[field]);
}

/**
 * Check if a profile is complete
 * @param profile User profile object
 * @returns boolean indicating if all required fields are present
 */
export function isProfileComplete(profile: UserProfile): boolean {
    return getMissingFields(profile).length === 0;
}

/**
 * Get the next required field to ask about
 * @param profile User profile object
 * @returns The next field to ask about, or null if profile is complete
 */
export function getNextRequiredField(profile: UserProfile): RequiredField | null {
    const missingFields = getMissingFields(profile);
    return missingFields.length > 0 ? missingFields[0] : null;
}

/**
 * Format missing fields for display
 * @param profile User profile object
 * @returns Formatted string of missing fields
 */
export function formatMissingFields(profile: UserProfile): string {
    const missingFields = getMissingFields(profile);
    if (missingFields.length === 0) return '';
    
    return missingFields
        .map(field => field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
        .join(', ');
}

/**
 * Generate error response for incomplete profile
 * @param profile User profile object
 * @returns Error response object with status code
 */
export function generateIncompleteProfileError(profile: UserProfile): { 
    error: string; 
    missing_fields: RequiredField[];
    status: number;
} {
    return {
        error: "Profile incomplete",
        missing_fields: getMissingFields(profile),
        status: 400
    };
} 