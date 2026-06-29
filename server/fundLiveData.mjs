const EASTMONEY_SEARCH_URL =
  'https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx';
const EASTMONEY_NAV_HISTORY_URL = 'https://api.fund.eastmoney.com/f10/lsjz';
const TIANTIAN_ESTIMATE_URL = 'https://fundgz.1234567.com.cn/js';

const normalizePercent = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const text = String(value);
  return text.endsWith('%') ? text : `${text}%`;
};

const compactObject = (value) =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== ''));

const formatPercentValue = (value) => `${Math.abs(value) < 0.005 ? '0.00' : value.toFixed(2)}%`;

const shiftDate = (date, { months = 0, years = 0 }) => {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() - months);
  copy.setFullYear(copy.getFullYear() - years);
  return copy;
};

const findBaselineRecord = (history, targetDate) => {
  let candidate = history[0];

  for (const record of history) {
    if (new Date(record.date) <= targetDate) {
      candidate = record;
    } else {
      break;
    }
  }

  return candidate;
};

const calculateReturn = (latest, baseline) => {
  if (!latest || !baseline || baseline.nav <= 0) {
    return undefined;
  }

  return formatPercentValue(((latest.nav - baseline.nav) / baseline.nav) * 100);
};

export function parseFundEstimateJsonp(jsonpText) {
  const match = String(jsonpText).match(/\((.*)\)\s*;?\s*$/s);
  if (!match) {
    return {};
  }

  const data = JSON.parse(match[1]);

  return compactObject({
    code: data.fundcode,
    liveName: data.name,
    navDate: data.jzrq,
    latestNav: data.dwjz,
    estimatedNav: data.gsz,
    estimatedChange: normalizePercent(data.gszzl),
    estimateTime: data.gztime,
  });
}

export function parseEastmoneySuggest(response) {
  const item = response?.Datas?.[0];
  if (!item) {
    return {};
  }

  const base = item.FundBaseInfo ?? {};

  return compactObject({
    code: item.CODE ?? base.FCODE,
    liveName: base.SHORTNAME ?? item.NAME,
    type: base.FTYPE,
    manager: base.JJJL,
    navDate: base.FSRQ,
    latestNav: base.DWJZ === undefined || base.DWJZ === null ? undefined : String(base.DWJZ),
    liveTags: Array.isArray(item.ZTJJInfo)
      ? item.ZTJJInfo.map((tag) => tag.TTYPENAME).filter(Boolean)
      : undefined,
  });
}

export function parseHistoricalNav(response) {
  const list = response?.Data?.LSJZList;
  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .map((item) => ({
      date: item.FSRQ,
      nav: Number(item.DWJZ),
    }))
    .filter((item) => item.date && Number.isFinite(item.nav))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateHistoricalPerformance(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return {};
  }

  const latest = history[history.length - 1];
  const latestDate = new Date(latest.date);
  let peak = history[0].nav;
  let maxDrawdown = 0;

  for (const record of history) {
    peak = Math.max(peak, record.nav);
    if (peak > 0) {
      maxDrawdown = Math.max(maxDrawdown, ((peak - record.nav) / peak) * 100);
    }
  }

  return compactObject({
    oneMonthReturn: calculateReturn(latest, findBaselineRecord(history, shiftDate(latestDate, { months: 1 }))),
    threeMonthReturn: calculateReturn(latest, findBaselineRecord(history, shiftDate(latestDate, { months: 3 }))),
    sixMonthReturn: calculateReturn(latest, findBaselineRecord(history, shiftDate(latestDate, { months: 6 }))),
    oneYearReturn: calculateReturn(latest, findBaselineRecord(history, shiftDate(latestDate, { years: 1 }))),
    maxDrawdown: formatPercentValue(maxDrawdown),
    navHistory: history.slice(-90),
    performanceAsOf: latest.date,
  });
}

export async function fetchHistoricalPerformance(code, fetcher = fetch, pageCount = 14) {
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);
  const results = await Promise.allSettled(
    pages.map((pageIndex) => {
      const url = `${EASTMONEY_NAV_HISTORY_URL}?fundCode=${encodeURIComponent(
        code,
      )}&pageIndex=${pageIndex}&pageSize=20&startDate=&endDate=`;
      return requestJson(url, fetcher, 'https://fundf10.eastmoney.com/');
    }),
  );

  const records = results
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => result.value?.Data?.LSJZList ?? []);
  const uniqueRecords = Array.from(new Map(records.map((record) => [record.FSRQ, record])).values());

  return calculateHistoricalPerformance(parseHistoricalNav({ Data: { LSJZList: uniqueRecords } }));
}

export function mergeLiveFundData(localFund, liveData = {}) {
  return compactObject({
    ...localFund,
    name: liveData.liveName ?? localFund.name,
    type: liveData.type ?? localFund.type,
    manager: liveData.manager ?? localFund.manager,
    navDate: liveData.navDate,
    latestNav: liveData.latestNav,
    estimatedNav: liveData.estimatedNav,
    estimatedChange: liveData.estimatedChange,
    estimateTime: liveData.estimateTime,
    oneMonthReturn: liveData.oneMonthReturn,
    threeMonthReturn: liveData.threeMonthReturn,
    sixMonthReturn: liveData.sixMonthReturn,
    oneYearReturn: liveData.oneYearReturn ?? localFund.oneYearReturn,
    maxDrawdown: liveData.maxDrawdown ?? localFund.maxDrawdown,
    navHistory: liveData.navHistory,
    performanceAsOf: liveData.performanceAsOf,
    liveTags: liveData.liveTags,
    dataSource: Object.keys(liveData).length > 0 ? '实时接口' : '本地主题池',
  });
}

const requestText = async (url, fetcher, referer = 'https://fund.eastmoney.com/') => {
  const response = await fetcher(url, {
    headers: {
      Referer: referer,
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 fund-recommendation-site',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.text();
};

const requestJson = async (url, fetcher, referer = 'https://fund.eastmoney.com/') => {
  const response = await fetcher(url, {
    headers: {
      Referer: referer,
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 fund-recommendation-site',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
};

export async function fetchLiveFundData(code, fetcher = fetch, options = {}) {
  const { includeHistory = true, historyPageCount = 14 } = options;
  const estimateUrl = `${TIANTIAN_ESTIMATE_URL}/${code}.js?rt=${Date.now()}`;
  const suggestUrl = `${EASTMONEY_SEARCH_URL}?m=1&key=${encodeURIComponent(code)}`;

  const requests = [
    requestText(estimateUrl, fetcher).then(parseFundEstimateJsonp),
    requestJson(suggestUrl, fetcher).then(parseEastmoneySuggest),
  ];

  if (includeHistory) {
    requests.push(fetchHistoricalPerformance(code, fetcher, historyPageCount));
  }

  const [estimateResult, suggestResult, historyResult] = await Promise.allSettled(requests);

  return {
    ...(suggestResult.status === 'fulfilled' ? suggestResult.value : {}),
    ...(estimateResult.status === 'fulfilled' ? estimateResult.value : {}),
    ...(historyResult.status === 'fulfilled' ? historyResult.value : {}),
  };
}

export async function enrichFund(localFund, fetcher = fetch, options = {}) {
  const liveData = await fetchLiveFundData(localFund.code, fetcher, options);
  return mergeLiveFundData(localFund, liveData);
}

export async function enrichFunds(localFunds, fetcher = fetch) {
  return Promise.all(localFunds.map((fund) => enrichFund(fund, fetcher, { includeHistory: false })));
}
