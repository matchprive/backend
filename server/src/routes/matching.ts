import express, { Request, Response, Router, RequestHandler } from 'express';
import { calculateCompatibilityScore, hasDealbreakerConflicts } from '../utils/matchingSystem';
import { validateResponses } from '../utils/responseProcessor';

interface UserResponses {
    [key: string]: any;
}

interface CalculateRequest {
    user1Responses: UserResponses;
    user2Responses: UserResponses;
}

interface ValidateRequest {
    responses: UserResponses;
}

interface RecommendationsRequest {
    userResponses: UserResponses;
    potentialMatches: Array<{
        userId: string;
        responses: UserResponses;
    }>;
}

const router: Router = express.Router();

// Calculate compatibility between two users
router.post('/calculate', (async (req: Request<{}, {}, CalculateRequest>, res: Response): Promise<void> => {
    try {
        const { user1Responses, user2Responses } = req.body;

        if (!user1Responses || !user2Responses) {
            res.status(400).json({
                error: 'Missing required user responses'
            });
            return;
        }

        // Check for dealbreaker conflicts first
        if (hasDealbreakerConflicts(user1Responses, user2Responses)) {
            res.status(200).json({
                score: 0,
                hasDealbreakerConflicts: true,
                message: 'Dealbreaker conflicts detected'
            });
            return;
        }

        // Calculate compatibility score
        const result = calculateCompatibilityScore(user1Responses, user2Responses);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error calculating compatibility:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}) as RequestHandler);

// Validate user responses
router.post('/validate', (async (req: Request<{}, {}, ValidateRequest>, res: Response): Promise<void> => {
    try {
        const { responses } = req.body;

        if (!responses) {
            res.status(400).json({
                error: 'Missing required responses'
            });
            return;
        }

        const validationResult = validateResponses(responses);

        res.status(200).json(validationResult);
    } catch (error) {
        console.error('Error validating responses:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}) as RequestHandler);

// Get matching recommendations
router.post('/recommendations', (async (req: Request<{}, {}, RecommendationsRequest>, res: Response): Promise<void> => {
    try {
        const { userResponses, potentialMatches } = req.body;

        if (!userResponses || !potentialMatches || !Array.isArray(potentialMatches)) {
            res.status(400).json({
                error: 'Missing required data'
            });
            return;
        }

        // Validate user responses
        const { valid: userValid, errors: userErrors } = validateResponses(userResponses);
        if (!userValid) {
            res.status(400).json({
                error: 'Invalid user responses',
                errors: userErrors
            });
            return;
        }

        // Calculate compatibility with each potential match
        const recommendations = potentialMatches
            .map(match => {
                const { valid: matchValid, errors: matchErrors } = validateResponses(match.responses);
                if (!matchValid) return null;

                const result = calculateCompatibilityScore(userResponses, match.responses);
                return {
                    userId: match.userId,
                    ...result
                };
            })
            .filter(Boolean)
            .sort((a, b) => b!.score - a!.score);

        res.status(200).json({
            recommendations,
            count: recommendations.length
        });
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}) as RequestHandler);

export default router; 