export interface UserProfile {
    name: string;
    age: number;
    gender: string;
    bio: string;
    photos: string[];
    preferences: {
        age_range: [number, number];
        distance: number;
        gender: string[];
    };
    traits: {
        cognitive_style?: string;
        communication?: string;
        emotional_expression?: string;
        values?: string[];
        interests?: string[];
        archetype?: string;
        religion?: string;
        children?: string;
        monogamy?: string;
        location?: string;
        lifestyle?: string;
    };
    goals: {
        relationship_type: string;
        timeline: string;
        children: string;
        location: string;
    };
    [key: string]: any; // Allow for additional properties
} 