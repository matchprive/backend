import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { UserProfile } from '../types';

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

export const createSession = (user: User): string => {
    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );
    return token;
};

export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
        const user = await userRepository.findOne({ where: { id: decoded.userId } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

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