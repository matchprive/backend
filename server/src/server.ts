import express, { Request } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { calculateFinalScore, calculateArchetypeScore, matchingFunctions, hasDealbreakerConflict } from './utils/matchingAlgorithm';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        password: string;
        chats: Array<{
          id: string;
          messages: any[];
          timestamp: string;
        }>;
      };
    }
  }
}

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory session store
const sessions = new Map<string, {
  email?: string;
  profile?: any;
  chats?: Array<{
    id: string;
    message: string;
    sender: 'user' | 'gpt';
    timestamp: string;
  }>;
}>();

// In-memory storage (replace with database in production)
const users: { [key: string]: { email: string; password: string; chats: any[] } } = {};

// Authentication middleware
const authenticateUser = (req: Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || !users[token]) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = users[token];
  next();
};

// Create a new session
app.post('/api/session/create', (req, res) => {
  const sessionId = uuidv4();
  sessions.set(sessionId, {});
  res.json({ sessionId });
});

// Save email to session
app.post('/api/session/:sessionId/email', (req, res) => {
  const { sessionId } = req.params;
  const { email } = req.body;

  if (!sessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const session = sessions.get(sessionId)!;
  session.email = email;
  res.json({ success: true });
});

// Update session profile
app.put('/api/session/:sessionId/profile', (req, res) => {
  const { sessionId } = req.params;
  const { profile } = req.body;

  if (!sessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const session = sessions.get(sessionId)!;
  session.profile = profile;
  res.json({ success: true });
});

// Match two users
app.get('/api/match', (req, res) => {
  const { user1_id, user2_id } = req.query;

  if (!user1_id || !user2_id || typeof user1_id !== 'string' || typeof user2_id !== 'string') {
    return res.status(400).json({ error: 'Invalid user IDs' });
  }

  const user1 = sessions.get(user1_id);
  const user2 = sessions.get(user2_id);

  if (!user1?.profile || !user2?.profile) {
    return res.status(404).json({ error: 'One or both user profiles not found' });
  }

  // Check for dealbreaker conflicts
  const conflict = hasDealbreakerConflict(user1.profile, user2.profile);
  if (conflict) {
    return res.json({
      score: 0,
      details: {
        traitScores: {},
        archetypeScore: 0,
        conflicts: [conflict]
      }
    });
  }

  // Calculate trait scores
  const traitScores: Record<string, number> = {};
  for (const [trait, fn] of Object.entries(matchingFunctions)) {
    traitScores[trait] = fn(user1.profile, user2.profile);
  }

  // Calculate archetype score
  const archetypeScore = calculateArchetypeScore(user1.profile, user2.profile);

  // Calculate final score
  const score = calculateFinalScore(traitScores, archetypeScore);

  res.json({
    score,
    details: {
      traitScores,
      archetypeScore,
      conflicts: null
    }
  });
});

// User registration
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  
  // Check if user already exists
  if (Object.values(users).some(user => user.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const token = uuidv4();
  users[token] = {
    email,
    password, // In production, hash the password
    chats: []
  };

  res.json({ token });
});

// User login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = Object.values(users).find(u => u.email === email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = Object.keys(users).find(key => users[key].email === email);
  res.json({ token });
});

// Get user's chat history
app.get('/api/chats', authenticateUser, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not found' });
  }
  res.json(req.user.chats);
});

// Save a new chat
app.post('/api/chats', authenticateUser, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not found' });
  }
  const { messages } = req.body;
  const chatId = uuidv4();
  const newChat = {
    id: chatId,
    messages,
    timestamp: new Date().toISOString()
  };
  
  req.user.chats.push(newChat);
  res.json(newChat);
});

// Get a specific chat
app.get('/api/chats/:chatId', authenticateUser, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not found' });
  }
  const chat = req.user.chats.find(c => c.id === req.params.chatId);
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }
  res.json(chat);
});

// Delete a chat
app.delete('/api/chats/:chatId', authenticateUser, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not found' });
  }
  const index = req.user.chats.findIndex(c => c.id === req.params.chatId);
  if (index === -1) {
    return res.status(404).json({ error: 'Chat not found' });
  }
  
  req.user.chats.splice(index, 1);
  res.json({ success: true });
});

// Start a new session
app.post('/api/session/start', (req, res) => {
  const sessionId = uuidv4();
  sessions.set(sessionId, {});
  res.json({ 
    user_id: sessionId,
    initial_message: "Hello! I'm your MatchPrivé compatibility assistant. How can I help you today?"
  });
});

// Send a chat message
app.post('/api/chat/message', (req, res) => {
  const { user_id, message } = req.body;
  
  if (!sessions.has(user_id)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // For now, just echo back a simple response
  res.json({
    message: "I understand you're interested in compatibility matching. Let me help you with that.",
    profile_completed: false
  });
});

// Get chat history
app.get('/api/chat/:userId/history', (req, res) => {
  const { userId } = req.params;
  
  if (!sessions.has(userId)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const session = sessions.get(userId)!;
  res.json(session.chats || []);
});

// Get user profile
app.get('/api/profile/:userId', (req, res) => {
  const { userId } = req.params;
  
  if (!sessions.has(userId)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const session = sessions.get(userId)!;
  res.json({
    id: userId,
    profile_completed: !!session.profile,
    report_path: session.profile?.report_path,
    report_sent_at: session.profile?.report_sent_at,
    report_sent_status: session.profile?.report_sent_status
  });
});

// Check report status
app.get('/api/profile/:userId/report', (req, res) => {
  const { userId } = req.params;
  
  if (!sessions.has(userId)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const session = sessions.get(userId)!;
  res.json({
    id: userId,
    profile_completed: !!session.profile,
    report_path: session.profile?.report_path,
    report_sent_at: session.profile?.report_sent_at,
    report_sent_status: session.profile?.report_sent_status
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 