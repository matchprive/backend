import express, { Request, Response } from 'express';
import { getSession } from '../utils/sessionManagement';
import { 
  hasDealbreakerConflict, 
  matchingFunctions, 
  calculateArchetypeScore, 
  calculateFinalScore 
} from '../utils/matchingAlgorithm';
import { Router } from 'express';
import { validateSession } from '../utils/sessionManagement';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);

/**
 * Compare two users and calculate compatibility
 * @route GET /api/match
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { user1_id, user2_id } = req.query;

    if (!user1_id || !user2_id) {
      return res.status(400).json({ error: 'Both user1_id and user2_id are required' });
    }

    // Get both user profiles
    const user1Session = getSession(user1_id as string);
    const user2Session = getSession(user2_id as string);

    if (!user1Session || !user2Session) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    const user1Profile = user1Session.profile;
    const user2Profile = user2Session.profile;

    // Check for dealbreaker conflicts
    const hasConflict = hasDealbreakerConflict(user1Profile, user2Profile);
    if (hasConflict) {
      return res.json({
        compatible: false,
        reason: 'Dealbreaker conflict detected',
        conflict_details: hasConflict
      });
    }

    // Calculate trait compatibility scores
    const traitScores: Record<string, number> = {};
    for (const [trait, matchingFunction] of Object.entries(matchingFunctions)) {
      traitScores[trait] = matchingFunction(user1Profile, user2Profile);
    }

    // Calculate archetype compatibility
    const archetypeScore = calculateArchetypeScore(user1Profile, user2Profile);

    // Calculate final compatibility score
    const finalScore = calculateFinalScore(traitScores, archetypeScore);

    return res.json({
      compatible: true,
      final_score: finalScore,
      trait_breakdown: traitScores,
      archetype_score: archetypeScore,
      user1_profile: user1Profile,
      user2_profile: user2Profile
    });
  } catch (error) {
    console.error('Error calculating match:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/profile/:userId/report', validateSession, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUser = req.user as User;

    // Get target user
    const targetUser = await userRepository.findOne({ where: { id: targetUserId } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate compatibility score
    const score = calculateFinalScore({ profile: targetUser.profile as any });

    res.json({
      score,
      archetypeScore: {
        traits: score,
        preferences: score,
        goals: score
      },
      hasDealbreaker: false,
      compatibility: {
        traits: score,
        preferences: score,
        goals: score
      }
    });
  } catch (error) {
    console.error('Error generating compatibility report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 