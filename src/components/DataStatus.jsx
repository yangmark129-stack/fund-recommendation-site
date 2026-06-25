import React from 'react';

const formatTime = (isoTime) => {
  if (!isoTime) {
    return '暂无';
  }

  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) {
    return isoTime;
  }

  return date.toLocaleString('zh-CN', {
    hour12: false,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function DataStatus({ isLoading, meta }) {
  return (
    <section className="data-status" aria-label="数据状态">
      <div>
        <strong>{isLoading ? '正在同步实时数据' : meta?.sourceLabel ?? '本地主题池'}</strong>
        <span>更新时间：{formatTime(meta?.fetchedAt)}</span>
      </div>
      {meta?.source === 'fallback' && (
        <p>实时接口暂不可用，当前展示本地主题池数据。页面结构和搜索筛选仍可正常使用。</p>
      )}
    </section>
  );
}
