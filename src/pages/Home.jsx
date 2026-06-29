import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { funds as fallbackFunds, hotTopics as fallbackTopics } from '../data/funds';
import { filterFunds } from '../utils/filterFunds';
import { loadFunds } from '../services/fundService';
import SearchBar from '../components/SearchBar';
import HotTopicTabs from '../components/HotTopicTabs';
import FundList from '../components/FundList';
import RiskNotice from '../components/RiskNotice';
import LoadingState from '../components/LoadingState';
import DataStatus from '../components/DataStatus';

export default function Home() {
  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState('全部');
  const [fundItems, setFundItems] = useState(fallbackFunds);
  const [topics, setTopics] = useState(fallbackTopics);
  const [meta, setMeta] = useState({
    source: 'fallback',
    sourceLabel: '本地主题池',
    fetchedAt: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    loadFunds().then((payload) => {
      if (!isMounted) {
        return;
      }

      setFundItems(payload.funds);
      setTopics(payload.hotTopics ?? fallbackTopics);
      setMeta(payload.meta);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredFunds = useMemo(
    () => filterFunds(fundItems, { query, topic: activeTopic }),
    [fundItems, query, activeTopic],
  );

  return (
    <main className="page-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">市场主题观察</span>
          <h1>热点基金观察</h1>
          <p>
            根据近期热点、行业趋势和主题线索展示关联基金信息，帮助你更快了解基金方向、历史表现和风险特征。
          </p>
        </div>
        <div className="market-panel" aria-label="市场热度概览">
          <div>
            <strong>{Math.max(topics.length - 1, 0)}</strong>
            <span>热点主题</span>
          </div>
          <div>
            <strong>{fundItems.length}</strong>
            <span>基金样本</span>
          </div>
          <div>
            <strong>{meta.source === 'live' ? 'Live' : 'Mock'}</strong>
            <span>数据源</span>
          </div>
        </div>
      </section>

      <section className="control-section" aria-label="基金搜索与热点筛选">
        <SearchBar value={query} onChange={setQuery} />
        <HotTopicTabs topics={topics} activeTopic={activeTopic} onChange={setActiveTopic} />
      </section>

      <DataStatus isLoading={isLoading} meta={meta} />

      {isLoading && <LoadingState />}
      <FundList funds={filteredFunds} />

      <RiskNotice />
    </main>
  );
}
