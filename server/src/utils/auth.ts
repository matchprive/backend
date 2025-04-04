import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '24h';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: number): Promise<string> {
  const token = generateToken(userId);
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