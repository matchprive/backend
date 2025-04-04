import express, { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { calculateFinalScore, calculateArchetypeScore, matchingFunctions, hasDealbreakerConflict } from './utils/matchingAlgorithm';
import matchingRoutes from './routes/matching';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { User as UserEntity } from './entities/User';
import { Chat as ChatEntity } from './entities/Chat';
import { Message as MessageEntity } from './entities/Message';
import { Match as MatchEntity } from './entities/Match';

// Load environment variables
dotenv.config();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserEntity;
    }
  }
}

interface User {
  id: string;
  email: string;
  password: string;
  profile: {
    name: string;
    age: number;
    gender: string;
    location: string;
    bio: string;
    interests: string[];
    photos: string[];
    archetype: {
      primary: string;
      secondary: string;
    };
    traits: {
      personality: string[];
      emotional: string[];
      cognitive: string[];
      conflict: string[];
      loveLanguage: string[];
      stressCoping: string[];
      homebody: string[];
      career: string[];
      sleep: string[];
      attachment: string[];
    };
    preferences: {
      ageRange: [number, number];
      distance: number;
      dealbreakers: string[];
      mustHaves: string[];
    };
  };
}

interface Session {
  id: string;
  email?: string;
  profile?: User['profile'];
  createdAt: Date;
}

interface Chat {
  id: string;
  userId1: string;
  userId2: string;
  messages: Array<{
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
}

interface Match {
  userId1: string;
  userId2: string;
  score: number;
  matchedAt: Date;
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5176',  // Your local development
    'https://your-vercel-app.vercel.app',  // Your Vercel frontend
    'https://*.vercel.app'  // Allow all Vercel deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize database
AppDataSource.initialize().catch(error => {
    console.error('Database initialization failed:', error);
    process.exit(1);
});

// In-memory storage for sessions (replace with Redis in production)
const sessions: Record<string, { id: string; email?: string; profile?: any; createdAt: Date }> = {};

// Authentication middleware
const authenticateUser: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const user = await AppDataSource.getRepository(UserEntity).findOne({ where: { id: token } });
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Routes
app.use('/api/matching', matchingRoutes);

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
    res.status(200).json({ status: 'ok' });
});

// Session management
app.post('/api/session', (req: Request, res: Response): void => {
  const sessionId = uuidv4();
  sessions[sessionId] = {
    id: sessionId,
    createdAt: new Date()
  };
  res.status(201).json({ sessionId });
});

app.post('/api/session/:sessionId/email', (req: Request<{ sessionId: string }>, res: Response): void => {
  const { sessionId } = req.params;
  const { email } = req.body;

  if (!sessions[sessionId]) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  sessions[sessionId].email = email;
  res.status(200).json({ message: 'Email updated' });
});

app.put('/api/session/:sessionId/profile', (req: Request<{ sessionId: string }>, res: Response): void => {
  const { sessionId } = req.params;
  const profile = req.body;

  if (!sessions[sessionId]) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  sessions[sessionId].profile = profile;
  res.status(200).json({ message: 'Profile updated' });
});

// User registration and authentication
app.post('/api/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, profile } = req.body;

    // Check if user already exists
    const existingUser = await AppDataSource.getRepository(UserEntity).findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Create new user
    const user = new UserEntity();
    user.email = email;
    user.password = password; // In production, hash the password
    user.profile = profile;

    // Save user to database
    await AppDataSource.getRepository(UserEntity).save(user);

    res.status(201).json({ userId: user.id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await AppDataSource.getRepository(UserEntity).findOne({ where: { email } });

    if (!user || user.password !== password) { // In production, use proper password comparison
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    res.json({ token: user.id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chat management
app.get('/api/chats', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userChats = await AppDataSource.getRepository(ChatEntity).find({
      where: [
        { user1: { id: req.user.id } },
        { user2: { id: req.user.id } }
      ],
      relations: ['user1', 'user2', 'messages']
    });

    res.json(userChats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/chats', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { userId2 } = req.body;
    const user2 = await AppDataSource.getRepository(UserEntity).findOne({ where: { id: userId2 } });
    if (!user2) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const chat = new ChatEntity();
    chat.user1 = req.user;
    chat.user2 = user2;

    await AppDataSource.getRepository(ChatEntity).save(chat);

    res.status(201).json({ chatId: chat.id });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/chats/:chatId', authenticateUser, async (req: Request<{ chatId: string }>, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const chat = await AppDataSource.getRepository(ChatEntity).findOne({
      where: { id: req.params.chatId },
      relations: ['user1', 'user2', 'messages']
    });

    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    if (chat.user1.id !== req.user.id && chat.user2.id !== req.user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(chat);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/chats/:chatId', authenticateUser, async (req: Request<{ chatId: string }>, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const chat = await AppDataSource.getRepository(ChatEntity).findOne({
      where: { id: req.params.chatId },
      relations: ['user1', 'user2']
    });

    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    if (chat.user1.id !== req.user.id && chat.user2.id !== req.user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await AppDataSource.getRepository(ChatEntity).remove(chat);
    res.status(204).send();
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Message handling
app.post('/api/chat/message', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { chatId, content } = req.body;
    const chat = await AppDataSource.getRepository(ChatEntity).findOne({
      where: { id: chatId },
      relations: ['user1', 'user2']
    });

    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    if (chat.user1.id !== req.user.id && chat.user2.id !== req.user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const message = new MessageEntity();
    message.sender = req.user;
    message.chat = chat;
    message.content = content;
    message.timestamp = new Date();

    await AppDataSource.getRepository(MessageEntity).save(message);
    res.status(201).json({ messageId: message.id });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/chat/:userId/history', authenticateUser, async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const chat = await AppDataSource.getRepository(ChatEntity).findOne({
      where: [
        { user1: { id: req.user.id }, user2: { id: req.params.userId } },
        { user1: { id: req.params.userId }, user2: { id: req.user.id } }
      ],
      relations: ['messages', 'messages.sender']
    });

    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    res.json(chat.messages);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile management
app.get('/api/profile/:userId', authenticateUser, async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await AppDataSource.getRepository(UserEntity).findOne({
      where: { id: req.params.userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user.profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/profile/:userId/report', authenticateUser, async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await AppDataSource.getRepository(UserEntity).findOne({
      where: { id: req.params.userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const score = calculateFinalScore(req.user, user);
    const archetypeScore = calculateArchetypeScore(req.user, user);
    const hasDealbreaker = hasDealbreakerConflict(req.user, user);

    res.json({
      score,
      archetypeScore,
      hasDealbreaker,
      compatibility: {
        traits: matchingFunctions.traits(req.user, user),
        preferences: matchingFunctions.preferences(req.user, user),
        goals: matchingFunctions.goals(req.user, user)
      }
    });
  } catch (error) {
    console.error('Get compatibility report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
};

app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 