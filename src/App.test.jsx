import '@testing-library/jest-dom/vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, test } from 'vitest';
import App from './App';

afterEach(() => cleanup());

const renderRoute = (initialEntry) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
    </MemoryRouter>,
  );

describe('fund recommendation app', () => {
  test('renders the home recommendation list and risk notice', () => {
    renderRoute('/');

    expect(screen.getByRole('heading', { name: '热点基金观察' })).toBeInTheDocument();
    expect(screen.getByText('华夏中证人工智能主题ETF')).toBeInTheDocument();
    expect(screen.getByLabelText('主题关联基金列表')).toBeInTheDocument();
    expect(screen.getByText(/本页面内容仅用于信息展示和学习参考/)).toBeInTheDocument();
  });

  test('filters funds by current topic and search query together', () => {
    renderRoute('/');

    fireEvent.click(screen.getByRole('button', { name: 'AI' }));
    fireEvent.change(screen.getByPlaceholderText('搜索基金名称或代码'), {
      target: { value: '半导体' },
    });

    expect(screen.getByText('华夏中证人工智能主题ETF')).toBeInTheDocument();
    expect(screen.queryByText('广发新能源精选混合')).not.toBeInTheDocument();
  });

  test('shows an empty state when search has no matching result', () => {
    renderRoute('/');

    fireEvent.change(screen.getByPlaceholderText('搜索基金名称或代码'), {
      target: { value: '不存在的基金' },
    });

    expect(screen.getByText('没有找到匹配的基金')).toBeInTheDocument();
  });

  test('renders fund detail by code', () => {
    renderRoute('/fund/515070');

    expect(screen.getByRole('heading', { name: '华夏中证人工智能主题ETF' })).toBeInTheDocument();
    expect(screen.getByText('基金代码 515070')).toBeInTheDocument();
    expect(screen.getByText('历史表现')).toBeInTheDocument();
    expect(screen.getByText('主要持仓方向')).toBeInTheDocument();
    expect(screen.getByText('主题关联理由')).toBeInTheDocument();
  });

  test('generates a single fund observation report from the detail page', async () => {
    renderRoute('/fund/515070');

    fireEvent.click(screen.getByRole('button', { name: '生成观察报告' }));

    expect(await screen.findByRole('heading', { name: '华夏中证人工智能主题ETF观察报告' })).toBeInTheDocument();
    expect(screen.getByText('综合风险判断')).toBeInTheDocument();
    expect(screen.getByText('数据说明与风险提示')).toBeInTheDocument();
    expect(screen.getByText(/不构成投资建议/)).toBeInTheDocument();
  });

  test('renders not found state for an unknown fund code', () => {
    renderRoute('/fund/000000');

    expect(screen.getByText('基金不存在')).toBeInTheDocument();
  });
});
