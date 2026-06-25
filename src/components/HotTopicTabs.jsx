import React from 'react';

export default function HotTopicTabs({ topics, activeTopic, onChange }) {
  return (
    <div className="topic-tabs" aria-label="热点主题筛选">
      {topics.map((topic) => (
        <button
          key={topic}
          type="button"
          className={topic === activeTopic ? 'topic-tab topic-tab--active' : 'topic-tab'}
          onClick={() => onChange(topic)}
        >
          {topic}
        </button>
      ))}
    </div>
  );
}
