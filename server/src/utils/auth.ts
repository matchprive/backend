import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource, query } from '../config/database';
import { User } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '24h';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '24h',
  });
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return userRepository.findOne({ where: { email } });
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