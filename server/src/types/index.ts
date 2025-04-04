export interface UserProfile {
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