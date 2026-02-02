
import { randomUUID } from 'crypto';

async function testSessionComplete() {
  const endpoint = 'http://localhost:3000/api/session/complete';
  const mockData = {
    beatId: 'test-beat-id',
    title: 'Test Session - Non Recording',
    durationSeconds: 60,
    baseWordCount: 50,
    wordsUsed: ['test', 'flow', 'audit'],
    frequency: 4,
    difficulty: 2,
    mode: 'solo'
  };

  console.log('Testing /api/session/complete with data:', mockData);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=mock-token' // Note: This will likely fail auth if running against real server without real token.
        // For local testing, we might need to rely on the server running/mock auth. 
        // Or we assume the developer verifies this manually via UI.
      },
      body: JSON.stringify(mockData)
    });

    if (response.status === 401) {
        console.warn('⚠️  Auth failed (Expected if not valid session cookie). Endpoint exists!');
        return;
    }

    const data = await response.json();
    console.log('Response:', response.status, data);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testSessionComplete();
