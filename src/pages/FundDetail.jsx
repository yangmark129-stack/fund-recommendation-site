import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { funds } from '../data/funds';
import { findFundByCode } from '../utils/filterFunds';
import { loadFunds } from '../services/fundService';
import RiskNotice from '../components/RiskNotice';
import DataStatus from '../components/DataStatus';

const Metric = ({ label, value, tone }) => (
  <div className={`detail-metric ${tone ? `detail-metric--${tone}` : ''}`}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export default function FundDetail() {
  const { code } = useParams();
  const [fundItems, setFundItems] = useState(funds);
  const [meta, setMeta] = useState({
    source: 'fallback',
    sourceLabel: '本地主题池',
    fetchedAt: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const fund = findFundByCode(fundItems, code);

  useEffect(() => {
    let isMounted = true;

    loadFunds().then((payload) => {
      if (!isMounted) {
        return;
      }

      setFundItems(payload.funds);
      setMeta(payload.meta);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!fund) {
    return (
      <main className="page-shell detail-shell">
        <Link className="back-link" to="/">
          返回首页
        </Link>
        <section className="not-found-card">
          <h1>基金不存在</h1>
          <p>没有找到代码为 {code} 的基金，请返回首页重新搜索。</p>
        </section>
        <DataStatus isLoading={isLoading} meta={meta} />
        <RiskNotice />
      </main>
    );
  }

  return (
    <main className="page-shell detail-shell">
      <Link className="back-link" to="/">
        返回首页
      </Link>

      <section className="detail-hero">
        <div>
          <span className="eyebrow">基金详情</span>
          <h1>{fund.name}</h1>
          <p>基金代码 {fund.code}</p>
        </div>
        <span className="risk-pill">{fund.riskLevel}</span>
      </section>

      <section className="detail-grid">
        <Metric label="基金类型" value={fund.type} />
        <Metric label="成立时间" value={fund.establishDate} />
        <Metric label="基金规模" value={fund.fundSize} />
        <Metric label="基金经理" value={fund.manager} />
        <Metric label="最新净值" value={fund.latestNav ?? '接口同步中'} />
        <Metric label="估算涨跌" value={fund.estimatedChange ?? '接口同步中'} tone="positive" />
        <Metric label="估算净值" value={fund.estimatedNav ?? '接口同步中'} />
        <Metric label="估值时间" value={fund.estimateTime ?? fund.navDate ?? '接口同步中'} />
        <Metric label="近一年收益率" value={fund.oneYearReturn} tone="positive" />
        <Metric label="近三年收益率" value={fund.threeYearReturn} tone="positive" />
        <Metric label="最大回撤" value={fund.maxDrawdown} tone="warning" />
        <Metric label="风险等级" value={fund.riskLevel} />
      </section>

      <DataStatus isLoading={isLoading} meta={meta} />

      <section className="detail-section">
        <h2>主要持仓方向</h2>
        <div className="tag-row">
          {fund.holdings.map((holding) => (
            <span key={holding} className="soft-tag">
              {holding}
            </span>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <h2>关联热点</h2>
        <div className="tag-row">
          {fund.hotTags.map((tag) => (
            <span key={tag} className="hot-tag">
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <h2>基金介绍</h2>
        <p>{fund.description}</p>
      </section>

      <section className="detail-section">
        <h2>推荐理由</h2>
        <p>{fund.reason}</p>
      </section>

      <section className="detail-section detail-risk">
        <h2>风险提示</h2>
        <p>{fund.riskTip}</p>
      </section>

      <RiskNotice />
    </main>
  );
}
