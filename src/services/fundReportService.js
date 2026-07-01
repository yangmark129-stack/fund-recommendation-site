const SECTION_TITLES = [
  '综合风险判断',
  '收益表现解读',
  '回撤与波动提示',
  '主题集中度提示',
  '观察建议',
  '数据说明与风险提示',
];

const compact = (items) => items.filter(Boolean);

export function parsePercent(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const match = String(value).trim().match(/-?\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

const declaredRiskScore = (riskLevel = '') => {
  if (riskLevel.includes('中高风险')) {
    return 3;
  }

  if (riskLevel.includes('高风险')) {
    return 4;
  }

  if (riskLevel.includes('中风险')) {
    return 2;
  }

  if (riskLevel.includes('低风险')) {
    return 1;
  }

  return 2;
};

const drawdownRiskScore = (drawdown) => {
  if (drawdown === null) {
    return 2;
  }

  if (drawdown >= 35) {
    return 4;
  }

  if (drawdown >= 30) {
    return 3;
  }

  if (drawdown >= 20) {
    return 2;
  }

  return 1;
};

const scoreToBand = (score) => {
  if (score >= 4) {
    return '高风险';
  }

  if (score >= 3) {
    return '中高风险';
  }

  if (score >= 2) {
    return '中风险';
  }

  return '低风险';
};

const formatPercent = (value) => (value === null ? '数据暂缺' : `${value.toFixed(2)}%`);

const getReturnValues = (fund) => ({
  oneMonth: parsePercent(fund.oneMonthReturn),
  threeMonth: parsePercent(fund.threeMonthReturn),
  sixMonth: parsePercent(fund.sixMonthReturn),
  oneYear: parsePercent(fund.oneYearReturn),
});

export function classifyFundRisk(fund) {
  const drawdown = parsePercent(fund.maxDrawdown);
  const score = Math.max(declaredRiskScore(fund.riskLevel), drawdownRiskScore(drawdown));

  return {
    band: scoreToBand(score),
    score,
    drawdown,
    explanation: `结合基金标注风险等级“${fund.riskLevel ?? '未披露'}”和最大回撤${formatPercent(
      drawdown,
    )}，当前观察口径归为${scoreToBand(score)}。`,
  };
}

const describeReturns = (fund) => {
  const returns = getReturnValues(fund);
  const available = Object.values(returns).filter((value) => value !== null);

  if (available.length === 0) {
    return ['阶段收益数据暂缺，当前报告主要依据基金类型、风险等级、持仓方向和已有描述生成。'];
  }

  const negativeCount = available.filter((value) => value < 0).length;
  const oneYearText = returns.oneYear === null ? '近一年收益暂缺' : `近一年收益为${formatPercent(returns.oneYear)}`;

  return compact([
    `${oneYearText}，近 1 月、近 3 月、近 6 月数据用于观察短中期节奏。`,
    negativeCount > 0
      ? `可见部分阶段收益为负，说明净值节奏并不单边向上，适合结合回撤一起观察。`
      : `已披露阶段收益整体未见负值，但仍需要关注主题基金常见的估值波动。`,
    returns.oneMonth !== null && returns.oneYear !== null && returns.oneMonth > returns.oneYear
      ? `短期涨幅高于近一年表现，可能存在阶段性反弹或热度集中，需要避免只看短期涨幅。`
      : null,
  ]);
};

const describeDrawdown = (risk) => {
  if (risk.drawdown === null) {
    return ['最大回撤数据暂缺，暂不对历史下行幅度做强判断。'];
  }

  if (risk.drawdown >= 35) {
    return [`最大回撤达到${formatPercent(risk.drawdown)}，历史下行幅度较深，需要重点控制单一基金暴露。`];
  }

  if (risk.drawdown >= 30) {
    return [`最大回撤达到${formatPercent(risk.drawdown)}，波动压力偏高，观察时应重视回撤承受能力。`];
  }

  if (risk.drawdown >= 20) {
    return [`最大回撤为${formatPercent(risk.drawdown)}，属于需要持续跟踪的波动水平。`];
  }

  return [`最大回撤为${formatPercent(risk.drawdown)}，历史回撤相对受控，但不代表未来波动一定较低。`];
};

const describeTheme = (fund) => {
  const holdings = fund.holdings ?? [];
  const hotTags = fund.hotTags ?? [];
  const themeWords = [...holdings, ...hotTags];

  if (themeWords.length === 0) {
    return ['持仓方向和热点标签暂缺，暂不判断主题集中度。'];
  }

  return [
    `当前主要观察方向包括${themeWords.slice(0, 5).join('、')}。`,
    themeWords.length >= 4
      ? '主题暴露较集中，基金表现容易受到相关行业景气度、估值和政策预期影响。'
      : '主题线索较少，建议结合基金定期报告继续确认实际配置方向。',
  ];
};

const describeAction = (risk) => {
  if (risk.score >= 4) {
    return ['适合作为高波动观察标的，不宜仅凭短期热度做判断。', '若用于组合观察，应优先明确自身回撤承受能力。'];
  }

  if (risk.score >= 3) {
    return ['适合继续跟踪主题景气度、净值回撤和阶段收益是否改善。', '观察时可重点比较同类基金的回撤和长期表现。'];
  }

  return ['适合纳入常规观察清单，但仍需结合市场环境和基金定期报告复核。'];
};

export function generateFundReport(fund, options = {}) {
  const risk = classifyFundRisk(fund);
  const dataDate = fund.performanceAsOf ?? fund.estimateTime ?? fund.navDate ?? '数据日期暂缺';
  const generatedAt = options.generatedAt ?? new Date().toISOString();

  return {
    title: `${fund.name}观察报告`,
    subtitle: `基金代码 ${fund.code}`,
    generatedAt,
    dataDate,
    risk,
    sections: [
      {
        title: SECTION_TITLES[0],
        items: [risk.explanation],
      },
      {
        title: SECTION_TITLES[1],
        items: describeReturns(fund),
      },
      {
        title: SECTION_TITLES[2],
        items: describeDrawdown(risk),
      },
      {
        title: SECTION_TITLES[3],
        items: describeTheme(fund),
      },
      {
        title: SECTION_TITLES[4],
        items: describeAction(risk),
      },
      {
        title: SECTION_TITLES[5],
        items: [
          `本报告基于页面已读取的基金数据生成，统计日期为${dataDate}。`,
          '内容仅用于信息展示和学习参考，不构成投资建议，过往表现不代表未来收益。',
        ],
      },
    ],
    aiStatus: options.aiProvider ? 'ready' : 'not-configured',
  };
}
