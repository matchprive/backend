import { createSession, saveEmailToSession, updateSessionProfile } from '../utils/sessionManagement';
import { hasDealbreakerConflict, matchingFunctions, calculateArchetypeScore, calculateFinalScore } from '../utils/matchingAlgorithm';

// Create test profiles
const createTestProfile = (overrides = {}) => ({
  cognitive_style: 'analytical',
  communication: 'direct',
  emotional_expression: 'balanced',
  values: ['family', 'growth', 'adventure'],
  interests: ['reading', 'travel', 'cooking'],
  archetype: 'explorer',
  religion: 'atheist',
  children: 'want',
  monogamy: 'monogamous',
  location: 'urban',
  lifestyle: 'active',
  ...overrides
});

// Create two test sessions
const user1Id = createSession();
const user2Id = createSession();

// Set up user1 profile
updateSessionProfile(user1Id, createTestProfile({
  cognitive_style: 'analytical',
  communication: 'direct',
  emotional_expression: 'balanced',
  values: ['family', 'growth', 'adventure'],
  interests: ['reading', 'travel', 'cooking'],
  archetype: 'explorer'
}));

// Set up user2 profile
updateSessionProfile(user2Id, createTestProfile({
  cognitive_style: 'intuitive',
  communication: 'indirect',
  emotional_expression: 'expressive',
  values: ['family', 'creativity', 'connection'],
  interests: ['art', 'music', 'cooking'],
  archetype: 'creator'
}));

// Test matching
console.log('Testing matching between two users...');

// Get profiles
const user1Profile = createTestProfile();
const user2Profile = createTestProfile({
  cognitive_style: 'intuitive',
  communication: 'indirect',
  emotional_expression: 'expressive',
  values: ['family', 'creativity', 'connection'],
  interests: ['art', 'music', 'cooking'],
  archetype: 'creator'
});

// Check for dealbreaker conflicts
const conflict = hasDealbreakerConflict(user1Profile, user2Profile);
console.log('Dealbreaker conflict:', conflict);

// Calculate trait compatibility scores
const traitScores: Record<string, number> = {};
for (const [trait, matchingFunction] of Object.entries(matchingFunctions)) {
  traitScores[trait] = matchingFunction(user1Profile, user2Profile);
}
console.log('Trait compatibility scores:', traitScores);

// Calculate archetype compatibility
const archetypeScore = calculateArchetypeScore(user1Profile, user2Profile);
console.log('Archetype compatibility score:', archetypeScore);

// Calculate final compatibility score
const finalScore = calculateFinalScore(traitScores, archetypeScore);
console.log('Final compatibility score:', finalScore);

console.log('Test completed successfully!'); 