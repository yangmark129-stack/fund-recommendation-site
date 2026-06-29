import { funds, hotTopics } from '../data/funds';
import { findFundByCode } from '../utils/filterFunds';

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

export async function loadFund(code, fetcher = fetch) {
  try {
    const response = await fetcher(`/api/funds/${code}`);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return response.json();
  } catch (error) {
    return {
      fund: findFundByCode(funds, code),
      meta: {
        source: 'fallback',
        sourceLabel: '本地主题池',
        fetchedAt: new Date().toISOString(),
        error: error.message,
      },
    };
  }
}
