import { v4 as uuidv4 } from 'uuid';
import { UserProfile } from './fieldValidation';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface Session {
    id: string;
    email?: string;
    profile: UserProfile;
    chat_history: ChatMessage[];
    lastUpdated: Date;
    completedFields: string[];
}

// In-memory session store (replace with database in production)
const sessions: Map<string, Session> = new Map();

/**
 * Create a new session
 * @returns Session ID
 */
export function createSession(): string {
    const sessionId = uuidv4();
    const session: Session = {
        id: sessionId,
        profile: {},
        chat_history: [],
        lastUpdated: new Date(),
        completedFields: []
    };
    sessions.set(sessionId, session);
    return sessionId;
}

/**
 * Save email to session
 * @param sessionId Session ID
 * @param email User's email
 * @returns Success status
 */
export function saveEmailToSession(sessionId: string, email: string): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    session.email = email;
    session.lastUpdated = new Date();
    sessions.set(sessionId, session);
    return true;
}

/**
 * Get session by ID
 * @param sessionId Session ID
 * @returns Session object or null
 */
export function getSession(sessionId: string): Session | null {
    return sessions.get(sessionId) || null;
}

/**
 * Update session profile
 * @param sessionId Session ID
 * @param profile User profile data
 * @returns Success status
 */
export function updateSessionProfile(sessionId: string, profile: Partial<UserProfile>): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    session.profile = { ...session.profile, ...profile };
    session.lastUpdated = new Date();
    sessions.set(sessionId, session);
    return true;
}

/**
 * Mark field as completed
 * @param sessionId Session ID
 * @param field Field name
 * @returns Success status
 */
export function markFieldComplete(sessionId: string, field: string): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    if (!session.completedFields.includes(field)) {
        session.completedFields.push(field);
        session.lastUpdated = new Date();
        sessions.set(sessionId, session);
    }
    return true;
}

/**
 * Add message to chat history
 * @param sessionId Session ID
 * @param message Chat message
 * @returns Success status
 */
export function addChatMessage(sessionId: string, message: ChatMessage): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    session.chat_history.push({
        ...message,
        timestamp: new Date().toISOString()
    });
    session.lastUpdated = new Date();
    sessions.set(sessionId, session);
    return true;
}

/**
 * Generate resume link
 * @param sessionId Session ID
 * @returns Resume link URL
 */
export function generateResumeLink(sessionId: string): string {
    return `${window.location.origin}/resume?session=${sessionId}`;
} 