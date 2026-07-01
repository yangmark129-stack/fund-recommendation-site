import React from 'react';

const formatDateTime = (value) => {
  if (!value) {
    return '生成时间暂缺';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-CN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function FundReport({ report }) {
  if (!report) {
    return null;
  }

  return (
    <article className="fund-report" aria-label="基金观察报告">
      <header className="fund-report__header">
        <div>
          <span className="eyebrow">智能体报告</span>
          <h2>{report.title}</h2>
          <p>{report.subtitle}</p>
        </div>
        <span className="risk-pill">{report.risk.band}</span>
      </header>

      <div className="fund-report__meta" aria-label="报告元信息">
        <span>生成时间：{formatDateTime(report.generatedAt)}</span>
        <span>数据日期：{report.dataDate}</span>
        <span>AI 增强：{report.aiStatus === 'ready' ? '已预留接口' : '未启用'}</span>
      </div>

      <div className="fund-report__sections">
        {report.sections.map((section) => (
          <section className="fund-report__section" key={section.title}>
            <h3>{section.title}</h3>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
