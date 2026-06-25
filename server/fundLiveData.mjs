const EASTMONEY_SEARCH_URL =
  'https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx';
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
    liveTags: liveData.liveTags,
    dataSource: Object.keys(liveData).length > 0 ? '实时接口' : '本地主题池',
  });
}

const requestText = async (url, fetcher) => {
  const response = await fetcher(url, {
    headers: {
      Referer: 'https://fund.eastmoney.com/',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 fund-recommendation-site',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.text();
};

const requestJson = async (url, fetcher) => {
  const response = await fetcher(url, {
    headers: {
      Referer: 'https://fund.eastmoney.com/',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 fund-recommendation-site',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
};

export async function fetchLiveFundData(code, fetcher = fetch) {
  const estimateUrl = `${TIANTIAN_ESTIMATE_URL}/${code}.js?rt=${Date.now()}`;
  const suggestUrl = `${EASTMONEY_SEARCH_URL}?m=1&key=${encodeURIComponent(code)}`;

  const [estimateResult, suggestResult] = await Promise.allSettled([
    requestText(estimateUrl, fetcher).then(parseFundEstimateJsonp),
    requestJson(suggestUrl, fetcher).then(parseEastmoneySuggest),
  ]);

  return {
    ...(suggestResult.status === 'fulfilled' ? suggestResult.value : {}),
    ...(estimateResult.status === 'fulfilled' ? estimateResult.value : {}),
  };
}

export async function enrichFund(localFund, fetcher = fetch) {
  const liveData = await fetchLiveFundData(localFund.code, fetcher);
  return mergeLiveFundData(localFund, liveData);
}

export async function enrichFunds(localFunds, fetcher = fetch) {
  return Promise.all(localFunds.map((fund) => enrichFund(fund, fetcher)));
}
