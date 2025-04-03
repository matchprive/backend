import express from 'express';
import { getSession, updateSessionProfile } from '../utils/sessionManagement';

const router = express.Router();

/**
 * Resume a session by ID
 * @route GET /api/session/resume/:sessionId
 */
router.get('/resume/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Invalid session' });
    }

    return res.json({
      user_profile: session.profile,
      chat_history: session.chat_history || []
    });
  } catch (error) {
    console.error('Error resuming session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update session profile
 * @route PUT /api/session/:sessionId/profile
 */
router.put('/:sessionId/profile', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { profile } = req.body;

    const success = updateSessionProfile(sessionId, profile);
    if (!success) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating session profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 