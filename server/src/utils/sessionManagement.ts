import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { UserProfile } from '../types';
import { query } from '../config/database';

const userRepository = AppDataSource.getRepository(User);

interface Session {
    id: string;
    profile: UserProfile;
    lastUpdated: Date;
    chat_history?: any[];
}

const sessions: Map<string, Session> = new Map();

export const getSession = (sessionId: string): Session | null => {
    return sessions.get(sessionId) || null;
};

export async function createSession(userId: number): Promise<string> {
    const token = generateToken(userId.toString());
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

    await query(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, token, expiresAt]
    );

    return token;
}

export async function validateSession(token: string): Promise<number | null> {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    const result = await query(
        'SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()',
        [token]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0].user_id;
}

export async function invalidateSession(token: string): Promise<void> {
    await query(
        'DELETE FROM sessions WHERE token = $1',
        [token]
    );
}

function generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '24h',
    });
}

function verifyToken(token: string): { userId: string } | null {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    } catch (error) {
        return null;
    }
}

export const updateSessionProfile = (sessionId: string, profile: Partial<UserProfile>): boolean => {
    const session = sessions.get(sessionId);
    if (!session) return false;

    session.profile = { ...session.profile, ...profile };
    session.lastUpdated = new Date();
    sessions.set(sessionId, session);
    return true;
};

export const getSessionUser = async (token: string): Promise<User | null> => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
        return await userRepository.findOne({ where: { id: decoded.userId } });
    } catch (error) {
        return null;
    }
}; 