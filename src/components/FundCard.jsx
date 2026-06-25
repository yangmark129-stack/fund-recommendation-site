import React from 'react';
import { Link } from 'react-router-dom';

export default function FundCard({ fund }) {
  return (
    <article className="fund-card">
      <div className="fund-card__top">
        <div>
          <h2>{fund.name}</h2>
          <p>{fund.code} · {fund.type}</p>
        </div>
        <span className="risk-pill">{fund.riskLevel}</span>
      </div>

      <div className="tag-row">
        {fund.hotTags.map((tag) => (
          <span key={tag} className="hot-tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="return-grid">
        <div>
          <span>近一年</span>
          <strong>{fund.oneYearReturn}</strong>
        </div>
        <div>
          <span>近三年</span>
          <strong>{fund.threeYearReturn}</strong>
        </div>
      </div>

      <div className="live-grid">
        <div>
          <span>最新净值</span>
          <strong>{fund.latestNav ?? '同步中'}</strong>
        </div>
        <div>
          <span>估算涨跌</span>
          <strong>{fund.estimatedChange ?? '同步中'}</strong>
        </div>
      </div>

      <p className="reason-text">{fund.reason}</p>

      <Link className="detail-button" to={`/fund/${fund.code}`} aria-label={`查看${fund.name}详情`}>
        查看详情
      </Link>
    </article>
  );
}
