import { describe, expect, test } from 'vitest';
import { funds, hotTopics } from './funds';

describe('fund mock data', () => {
  test('contains at least 12 funds and every required hot topic has coverage', () => {
    expect(funds.length).toBeGreaterThanOrEqual(12);

    const requiredTopics = [
      'AI',
      '半导体',
      '新能源',
      '机器人',
      '医药',
      '消费',
      '黄金',
      '军工',
      '低空经济',
    ];

    for (const topic of requiredTopics) {
      expect(hotTopics).toContain(topic);
      expect(funds.some((fund) => fund.hotTags.includes(topic))).toBe(true);
    }
  });

  test('each fund contains the detail fields required by the detail page', () => {
    for (const fund of funds) {
      expect(fund.name).toBeTruthy();
      expect(fund.code).toMatch(/^\d{6}$/);
      expect(fund.type).toBeTruthy();
      expect(fund.establishDate).toBeTruthy();
      expect(fund.fundSize).toBeTruthy();
      expect(fund.manager).toBeTruthy();
      expect(fund.riskLevel).toBeTruthy();
      expect(fund.oneYearReturn).toMatch(/%$/);
      expect(fund.threeYearReturn).toMatch(/%$/);
      expect(fund.maxDrawdown).toMatch(/%$/);
      expect(fund.holdings.length).toBeGreaterThan(0);
      expect(fund.description).toBeTruthy();
      expect(fund.reason).toBeTruthy();
      expect(fund.riskTip).toBeTruthy();
    }
  });
});
