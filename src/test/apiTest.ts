import axios from 'axios';

interface SessionResponse {
  sessionId: string;
}

interface ProfileData {
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

interface ProfileUpdateRequest {
  profile: ProfileData;
}

interface MatchResponse {
  score: number;
  details: {
    traitScores: Record<string, number>;
    archetypeScore: number;
    conflicts: string[] | null;
  };
}

const API_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    console.log('Testing API endpoints...');

    // Create a session
    console.log('\n1. Creating a session...');
    const sessionResponse = await axios.post<SessionResponse>(`${API_URL}/session/create`);
    const sessionId = sessionResponse.data.sessionId;
    console.log(`Session created with ID: ${sessionId}`);

    // Save email to session
    console.log('\n2. Saving email to session...');
    await axios.post(`${API_URL}/session/${sessionId}/email`, {
      email: 'test@example.com'
    });
    console.log('Email saved successfully');

    // Update session profile
    console.log('\n3. Updating session profile...');
    const profileData: ProfileUpdateRequest = {
      profile: {
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
        lifestyle: 'active'
      }
    };
    await axios.put(`${API_URL}/session/${sessionId}/profile`, profileData);
    console.log('Profile updated successfully');

    // Create another session for matching
    console.log('\n4. Creating another session for matching...');
    const session2Response = await axios.post<SessionResponse>(`${API_URL}/session/create`);
    const session2Id = session2Response.data.sessionId;
    console.log(`Second session created with ID: ${session2Id}`);

    // Update second session profile
    console.log('\n5. Updating second session profile...');
    const profile2Data: ProfileUpdateRequest = {
      profile: {
        cognitive_style: 'intuitive',
        communication: 'indirect',
        emotional_expression: 'expressive',
        values: ['family', 'creativity', 'connection'],
        interests: ['art', 'music', 'cooking'],
        archetype: 'creator',
        religion: 'atheist',
        children: 'want',
        monogamy: 'monogamous',
        location: 'urban',
        lifestyle: 'active'
      }
    };
    await axios.put(`${API_URL}/session/${session2Id}/profile`, profile2Data);
    console.log('Second profile updated successfully');

    // Test matching
    console.log('\n6. Testing matching...');
    const matchResponse = await axios.get<MatchResponse>(`${API_URL}/match?user1_id=${sessionId}&user2_id=${session2Id}`);
    console.log('Match result:', matchResponse.data);

    console.log('\nAll tests completed successfully!');
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data: unknown }; message: string };
      console.error('Error testing API:', axiosError.response?.data || axiosError.message);
    } else {
      console.error('Error testing API:', error);
    }
  }
}

testAPI(); 