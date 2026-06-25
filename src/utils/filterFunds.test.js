import { describe, expect, test } from 'vitest';
import { funds } from '../data/funds';
import { filterFunds, findFundByCode } from './filterFunds';

describe('filterFunds', () => {
  test('returns all funds when search and topic are empty', () => {
    expect(filterFunds(funds, { query: '', topic: '全部' })).toHaveLength(funds.length);
  });

  test('filters by fund code with fuzzy matching', () => {
    const results = filterFunds(funds, { query: '5150', topic: '全部' });

    expect(results.some((fund) => fund.code === '515070')).toBe(true);
  });

  test('filters by fund name without case sensitivity for latin keywords', () => {
    const results = filterFunds(funds, { query: 'etf', topic: '全部' });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((fund) => fund.name.toLowerCase().includes('etf'))).toBe(true);
  });

  test('applies topic and search filters together', () => {
    const results = filterFunds(funds, { query: '半导体', topic: 'AI' });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((fund) => fund.hotTags.includes('AI'))).toBe(true);
    expect(
      results.every((fund) =>
        [fund.name, fund.code, fund.type, fund.reason, ...fund.hotTags, ...fund.holdings]
          .join(' ')
          .includes('半导体'),
      ),
    ).toBe(true);
  });
});

describe('findFundByCode', () => {
  test('finds a fund by route code', () => {
    expect(findFundByCode(funds, '515070')?.name).toContain('人工智能');
  });

  test('returns undefined when fund code does not exist', () => {
    expect(findFundByCode(funds, '000000')).toBeUndefined();
  });
});
