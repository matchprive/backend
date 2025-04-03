import axios from 'axios';
import assert from 'assert';

const API_URL = 'http://localhost:3000/api';

interface TestProfile {
  cognitive_style: string;
  communication: string;
  emotional_expression: string;
  values: string[];
  interests: string[];
  archetype: string;
  religion: string;
  children: string;
  monogamy: string;
  location: string;
  lifestyle: string;
}

interface SessionResponse {
  sessionId: string;
}

interface MatchResponse {
  score: number;
  details: {
    traitScores: Record<string, number>;
    archetypeScore: number;
    conflicts: string[] | null;
  };
}

async function testScenario(name: string, profile1: TestProfile, profile2: TestProfile) {
  console.log(`\nTesting scenario: ${name}`);
  
  try {
    // Create sessions for both users
    const session1 = await axios.post<SessionResponse>(`${API_URL}/session/create`);
    const session2 = await axios.post<SessionResponse>(`${API_URL}/session/create`);
    
    // Save test emails
    await axios.post(`${API_URL}/session/${session1.data.sessionId}/email`, {
      email: 'test1@example.com'
    });
    await axios.post(`${API_URL}/session/${session2.data.sessionId}/email`, {
      email: 'test2@example.com'
    });
    
    // Update profiles
    await axios.put(`${API_URL}/session/${session1.data.sessionId}/profile`, {
      profile: profile1
    });
    await axios.put(`${API_URL}/session/${session2.data.sessionId}/profile`, {
      profile: profile2
    });
    
    // Get match result
    const matchResult = await axios.get<MatchResponse>(
      `${API_URL}/match?user1_id=${session1.data.sessionId}&user2_id=${session2.data.sessionId}`
    );
    
    console.log('Match Score:', matchResult.data.score);
    console.log('Trait Scores:', matchResult.data.details.traitScores);
    console.log('Archetype Score:', matchResult.data.details.archetypeScore);
    console.log('Conflicts:', matchResult.data.details.conflicts);
    
    return matchResult.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data: unknown }; message: string };
      console.error('Error:', axiosError.response?.data || axiosError.message);
    } else {
      console.error('Error:', error);
    }
    throw error;
  }
}

async function runTests() {
  console.log('Starting comprehensive matching tests...\n');
  
  try {
    // Test Case 1: Perfect Match
    const perfectMatch = await testScenario(
      'Perfect Match',
      {
        cognitive_style: 'analytical',
        communication: 'direct',
        emotional_expression: 'balanced',
        values: ['growth', 'family', 'creativity'],
        interests: ['reading', 'travel', 'music'],
        archetype: 'explorer',
        religion: 'atheist',
        children: 'want',
        monogamy: 'monogamous',
        location: 'urban',
        lifestyle: 'active'
      },
      {
        cognitive_style: 'analytical',
        communication: 'direct',
        emotional_expression: 'balanced',
        values: ['growth', 'family', 'creativity'],
        interests: ['reading', 'travel', 'music'],
        archetype: 'explorer',
        religion: 'atheist',
        children: 'want',
        monogamy: 'monogamous',
        location: 'urban',
        lifestyle: 'active'
      }
    );
    assert(perfectMatch.score > 0.9, 'Perfect match should have a high score');

    // Test Case 2: Dealbreaker Conflict
    const dealbreaker = await testScenario(
      'Dealbreaker Conflict',
      {
        cognitive_style: 'analytical',
        communication: 'direct',
        emotional_expression: 'balanced',
        values: ['growth', 'family'],
        interests: ['reading', 'travel'],
        archetype: 'explorer',
        religion: 'atheist',
        children: 'want',
        monogamy: 'monogamous',
        location: 'urban',
        lifestyle: 'active'
      },
      {
        cognitive_style: 'intuitive',
        communication: 'indirect',
        emotional_expression: 'expressive',
        values: ['adventure', 'freedom'],
        interests: ['sports', 'gaming'],
        archetype: 'creator',
        religion: 'religious',
        children: 'dont_want',
        monogamy: 'polyamorous',
        location: 'rural',
        lifestyle: 'sedentary'
      }
    );
    assert(dealbreaker.score === 0, 'Dealbreaker conflicts should result in zero score');

    // Test Case 3: Moderate Match
    const moderateMatch = await testScenario(
      'Moderate Match',
      {
        cognitive_style: 'analytical',
        communication: 'direct',
        emotional_expression: 'balanced',
        values: ['growth', 'family', 'creativity'],
        interests: ['reading', 'travel', 'music'],
        archetype: 'explorer',
        religion: 'atheist',
        children: 'want',
        monogamy: 'monogamous',
        location: 'urban',
        lifestyle: 'active'
      },
      {
        cognitive_style: 'intuitive',
        communication: 'indirect',
        emotional_expression: 'expressive',
        values: ['family', 'creativity', 'freedom'],
        interests: ['music', 'art', 'travel'],
        archetype: 'creator',
        religion: 'atheist',
        children: 'want',
        monogamy: 'monogamous',
        location: 'urban',
        lifestyle: 'active'
      }
    );
    assert(moderateMatch.score > 0.4 && moderateMatch.score < 0.8, 'Moderate match should have a medium score');

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('\nTest suite failed:', error);
  }
}

runTests(); 