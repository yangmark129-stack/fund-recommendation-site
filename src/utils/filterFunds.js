const normalize = (value) => String(value ?? '').trim().toLowerCase();

const fundSearchText = (fund) =>
  normalize(
    [
      fund.name,
      fund.code,
      fund.type,
      fund.riskLevel,
      fund.reason,
      fund.description,
      fund.latestNav,
      fund.estimatedChange,
      fund.manager,
      ...fund.hotTags,
      ...fund.holdings,
      ...(fund.liveTags ?? []),
    ].join(' '),
  );

export const filterFunds = (funds, { query = '', topic = '全部' } = {}) => {
  const normalizedQuery = normalize(query);

  return funds.filter((fund) => {
    const matchesTopic = topic === '全部' || fund.hotTags.includes(topic);
    const matchesQuery = !normalizedQuery || fundSearchText(fund).includes(normalizedQuery);

    return matchesTopic && matchesQuery;
  });
};

export const findFundByCode = (funds, code) =>
  funds.find((fund) => normalize(fund.code) === normalize(code));
