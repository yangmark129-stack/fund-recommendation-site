import { describe, expect, test } from 'vitest';
import {
  calculateHistoricalPerformance,
  fetchLiveFundData,
  mergeLiveFundData,
  parseEastmoneySuggest,
  parseFundEstimateJsonp,
  parseHistoricalNav,
} from './fundLiveData.mjs';

describe('parseFundEstimateJsonp', () => {
  test('parses Tiantian fund estimate JSONP into live fund fields', () => {
    const jsonp =
      'jsonpgz({"fundcode":"515070","name":"人工智能ETF华夏","jzrq":"2026-06-24","dwjz":"2.6568","gsz":"2.7253","gszzl":"2.58","gztime":"2026-06-25 11:17"});';

    expect(parseFundEstimateJsonp(jsonp)).toEqual({
      code: '515070',
      liveName: '人工智能ETF华夏',
      navDate: '2026-06-24',
      latestNav: '2.6568',
      estimatedNav: '2.7253',
      estimatedChange: '2.58%',
      estimateTime: '2026-06-25 11:17',
    });
  });
});

describe('parseEastmoneySuggest', () => {
  test('maps Eastmoney search response into base fund fields', () => {
    const response = {
      ErrCode: 0,
      Datas: [
        {
          CODE: '515070',
          NAME: '人工智能ETF华夏',
          FundBaseInfo: {
            FTYPE: '指数型-股票',
            JJJL: '李俊',
            FSRQ: '2026-06-24',
            DWJZ: 2.6568,
          },
          ZTJJInfo: [{ TTYPENAME: '人工智能' }, { TTYPENAME: 'TMT' }],
        },
      ],
    };

    expect(parseEastmoneySuggest(response)).toEqual({
      code: '515070',
      liveName: '人工智能ETF华夏',
      type: '指数型-股票',
      manager: '李俊',
      navDate: '2026-06-24',
      latestNav: '2.6568',
      liveTags: ['人工智能', 'TMT'],
    });
  });
});

describe('parseHistoricalNav', () => {
  test('maps Eastmoney historical NAV response into chronological records', () => {
    const response = {
      Data: {
        LSJZList: [
          { FSRQ: '2026-06-26', DWJZ: '2.6264' },
          { FSRQ: '2026-06-25', DWJZ: '2.7533' },
          { FSRQ: '2026-06-24', DWJZ: '2.6568' },
        ],
      },
    };

    expect(parseHistoricalNav(response)).toEqual([
      { date: '2026-06-24', nav: 2.6568 },
      { date: '2026-06-25', nav: 2.7533 },
      { date: '2026-06-26', nav: 2.6264 },
    ]);
  });
});

describe('calculateHistoricalPerformance', () => {
  test('calculates period returns and max drawdown from NAV history', () => {
    const history = [
      { date: '2025-06-26', nav: 1 },
      { date: '2025-12-26', nav: 1.2 },
      { date: '2026-03-26', nav: 1.5 },
      { date: '2026-05-26', nav: 1.25 },
      { date: '2026-06-26', nav: 1.4 },
    ];

    expect(calculateHistoricalPerformance(history)).toEqual({
      oneMonthReturn: '12.00%',
      threeMonthReturn: '-6.67%',
      sixMonthReturn: '16.67%',
      oneYearReturn: '40.00%',
      maxDrawdown: '16.67%',
      navHistory: history,
      performanceAsOf: '2026-06-26',
    });
  });
});

describe('mergeLiveFundData', () => {
  test('keeps local topic metadata and overlays live values', () => {
    const localFund = {
      name: '华夏中证人工智能主题ETF',
      code: '515070',
      type: '指数型',
      hotTags: ['AI'],
      manager: '张明',
      oneYearReturn: '18.32%',
    };

    expect(
      mergeLiveFundData(localFund, {
        liveName: '人工智能ETF华夏',
        type: '指数型-股票',
        manager: '李俊',
        latestNav: '2.6568',
        estimatedNav: '2.7253',
        estimatedChange: '2.58%',
        estimateTime: '2026-06-25 11:17',
        oneMonthReturn: '3.10%',
        threeMonthReturn: '8.20%',
        sixMonthReturn: '12.30%',
        oneYearReturn: '22.40%',
        maxDrawdown: '15.60%',
        performanceAsOf: '2026-06-24',
      }),
    ).toEqual({
      name: '人工智能ETF华夏',
      code: '515070',
      type: '指数型-股票',
      hotTags: ['AI'],
      manager: '李俊',
      oneYearReturn: '18.32%',
      latestNav: '2.6568',
      estimatedNav: '2.7253',
      estimatedChange: '2.58%',
      estimateTime: '2026-06-25 11:17',
      oneMonthReturn: '3.10%',
      threeMonthReturn: '8.20%',
      sixMonthReturn: '12.30%',
      oneYearReturn: '22.40%',
      maxDrawdown: '15.60%',
      performanceAsOf: '2026-06-24',
      dataSource: '实时接口',
    });
  });
});

describe('fetchLiveFundData', () => {
  test('fetches estimate, base info, and historical performance with source-specific headers', async () => {
    const requested = [];
    const fetcher = async (url, options) => {
      requested.push({ url, referer: options.headers.Referer });

      if (url.includes('fundgz.1234567.com.cn')) {
        return {
          ok: true,
          text: async () =>
            'jsonpgz({"fundcode":"515070","name":"人工智能ETF华夏","jzrq":"2026-06-26","dwjz":"1.4000","gsz":"1.4100","gszzl":"0.71","gztime":"2026-06-29 13:00"});',
        };
      }

      if (url.includes('FundSearch')) {
        return {
          ok: true,
          json: async () => ({
            Datas: [
              {
                CODE: '515070',
                NAME: '人工智能ETF华夏',
                FundBaseInfo: { FTYPE: '指数型-股票', JJJL: '李俊' },
              },
            ],
          }),
        };
      }

      return {
        ok: true,
        json: async () => ({
          Data: {
            LSJZList: [
              { FSRQ: '2026-06-26', DWJZ: '1.4000' },
              { FSRQ: '2026-05-26', DWJZ: '1.2500' },
              { FSRQ: '2025-06-26', DWJZ: '1.0000' },
            ],
          },
        }),
      };
    };

    const result = await fetchLiveFundData('515070', fetcher, { historyPageCount: 1 });

    expect(result.oneMonthReturn).toBe('12.00%');
    expect(result.oneYearReturn).toBe('40.00%');
    expect(requested.find((item) => item.url.includes('lsjz')).referer).toBe(
      'https://fundf10.eastmoney.com/',
    );
  });
});
