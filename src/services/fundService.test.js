import { describe, expect, test, vi } from 'vitest';
import { loadFunds } from './fundService';

describe('loadFunds', () => {
  test('loads live funds from local API', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        funds: [{ code: '515070', name: '人工智能ETF华夏' }],
        meta: { source: 'live' },
      }),
    });

    const result = await loadFunds(fetcher);

    expect(fetcher).toHaveBeenCalledWith('/api/funds');
    expect(result.funds[0].name).toBe('人工智能ETF华夏');
    expect(result.meta.source).toBe('live');
  });

  test('returns fallback fund data when API request fails', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network failed'));

    const result = await loadFunds(fetcher);

    expect(result.funds.length).toBeGreaterThanOrEqual(12);
    expect(result.meta.source).toBe('fallback');
    expect(result.meta.error).toBe('network failed');
  });
});
