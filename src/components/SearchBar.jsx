import React from 'react';

export default function SearchBar({ value, onChange }) {
  return (
    <label className="search-bar">
      <span>基金搜索</span>
      <input
        type="search"
        value={value}
        placeholder="搜索基金名称或代码"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
