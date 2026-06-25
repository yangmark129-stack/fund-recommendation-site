import { funds, hotTopics } from '../data/funds';

export async function loadFunds(fetcher = fetch) {
  try {
    const response = await fetcher('/api/funds');
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return response.json();
  } catch (error) {
    return {
      funds,
      hotTopics,
      meta: {
        source: 'fallback',
        sourceLabel: '本地主题池',
        fetchedAt: new Date().toISOString(),
        error: error.message,
      },
    };
  }
}
