import { describe, expect, test } from 'vitest';
import { classifyFundRisk, generateFundReport, parsePercent } from './fundReportService';

describe('parsePercent', () => {
  test('parses signed percent text and ignores missing placeholders', () => {
    expect(parsePercent('18.32%')).toBe(18.32);
    expect(parsePercent('-4.08%')).toBe(-4.08);
    expect(parsePercent('接口同步中')).toBeNull();
    expect(parsePercent(undefined)).toBeNull();
  });
});

describe('classifyFundRisk', () => {
  test('raises the band when drawdown and declared risk are high', () => {
    expect(classifyFundRisk({ riskLevel: '高风险', maxDrawdown: '35.19%' }).band).toBe('高风险');
  });

  test('keeps moderate funds in a medium band when drawdown is controlled', () => {
    expect(classifyFundRisk({ riskLevel: '中风险', maxDrawdown: '12.06%' }).band).toBe('中风险');
  });
});

describe('generateFundReport', () => {
  test('generates the required Chinese sections with neutral observation language', () => {
    const report = generateFundReport({
      name: '华夏中证人工智能主题ETF',
      code: '515070',
      riskLevel: '中高风险',
      oneMonthReturn: '3.20%',
      threeMonthReturn: '-2.10%',
      sixMonthReturn: '8.30%',
      oneYearReturn: '18.32%',
      maxDrawdown: '28.12%',
      holdings: ['人工智能', '云计算', '半导体'],
      hotTags: ['AI', '半导体'],
      performanceAsOf: '2026-06-30',
    });

    expect(report.title).toBe('华夏中证人工智能主题ETF观察报告');
    expect(report.risk.band).toBe('中高风险');
    expect(report.sections.map((section) => section.title)).toEqual([
      '综合风险判断',
      '收益表现解读',
      '回撤与波动提示',
      '主题集中度提示',
      '观察建议',
      '数据说明与风险提示',
    ]);
    expect(report.sections.at(-1).items.join('')).toContain('不构成投资建议');
  });
});
