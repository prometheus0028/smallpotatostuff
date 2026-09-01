// Mocks
import analyzeMock from '../mock/analyze.json';
import analyzeDegradedMock from '../mock/analyze-degraded.json';

const USE_MOCKS = true; // Toggle this when backend is ready

export async function getAnalysis(symbol: string, userId: string, degraded = false) {
  if (USE_MOCKS) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return degraded ? analyzeDegradedMock : analyzeMock;
  }

  // Real API call would go here
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, user_id: userId }),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch analysis');
  }

  return res.json();
}
