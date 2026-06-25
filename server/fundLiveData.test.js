import { describe, expect, test } from 'vitest';
import {
  mergeLiveFundData,
  parseEastmoneySuggest,
  parseFundEstimateJsonp,
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
      dataSource: '实时接口',
    });
  });
});
