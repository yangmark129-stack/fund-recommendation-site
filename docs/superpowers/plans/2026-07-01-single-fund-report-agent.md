# Single Fund Report Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-fund observation report feature on the existing fund detail page.

**Architecture:** Keep report generation in a focused service and keep rendering in a reusable component. The fund detail page only owns the click interaction and generated report state. The service is deterministic by default and reserves an `aiProvider` option for future enhancement.

**Tech Stack:** React 18, Vite, Vitest, React Testing Library, existing CSS in `src/styles/global.css`.

---

## File Structure

- Create `src/services/fundReportService.js`: parse fund values, classify risk, and generate a structured Chinese report object.
- Create `src/services/fundReportService.test.js`: service-level TDD coverage for percent parsing, risk bands, and generated sections.
- Create `src/components/FundReport.jsx`: render the generated report model.
- Modify `src/pages/FundDetail.jsx`: add report state, generate button, and report component placement.
- Modify `src/App.test.jsx`: cover the user flow from detail page to generated report.
- Modify `src/styles/global.css`: style the report action, report sections, and mobile layout.

---

### Task 1: Report Service

**Files:**
- Create: `src/services/fundReportService.js`
- Test: `src/services/fundReportService.test.js`

- [ ] **Step 1: Write the failing service tests**

```js
import { describe, expect, test } from 'vitest';
import { classifyFundRisk, generateFundReport, parsePercent } from './fundReportService';

describe('parsePercent', () => {
  test('parses signed percent text and ignores missing placeholders', () => {
    expect(parsePercent('18.32%')).toBe(18.32);
    expect(parsePercent('-4.08%')).toBe(-4.08);
    expect(parsePercent('接口同步中')).toBeNull();
    expect(parsePercent(undefined)).toBeNull();
  });
});

describe('classifyFundRisk', () => {
  test('raises the band when drawdown and declared risk are high', () => {
    expect(classifyFundRisk({ riskLevel: '高风险', maxDrawdown: '35.19%' }).band).toBe('高风险');
  });

  test('keeps moderate funds in a medium band when drawdown is controlled', () => {
    expect(classifyFundRisk({ riskLevel: '中风险', maxDrawdown: '12.06%' }).band).toBe('中风险');
  });
});

describe('generateFundReport', () => {
  test('generates the required Chinese sections with neutral observation language', () => {
    const report = generateFundReport({
      name: '华夏中证人工智能主题ETF',
      code: '515070',
      riskLevel: '中高风险',
      oneMonthReturn: '3.20%',
      threeMonthReturn: '-2.10%',
      sixMonthReturn: '8.30%',
      oneYearReturn: '18.32%',
      maxDrawdown: '28.12%',
      holdings: ['人工智能', '云计算', '半导体'],
      hotTags: ['AI', '半导体'],
      performanceAsOf: '2026-06-30',
    });

    expect(report.title).toBe('华夏中证人工智能主题ETF观察报告');
    expect(report.risk.band).toBe('中高风险');
    expect(report.sections.map((section) => section.title)).toEqual([
      '综合风险判断',
      '收益表现解读',
      '回撤与波动提示',
      '主题集中度提示',
      '观察建议',
      '数据说明与风险提示',
    ]);
    expect(report.sections.at(-1).items.join('')).toContain('不构成投资建议');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/services/fundReportService.test.js`

Expected: FAIL because `src/services/fundReportService.js` does not exist.

- [ ] **Step 3: Implement the report service**

Create `parsePercent(value)`, `classifyFundRisk(fund)`, and `generateFundReport(fund, options = {})`. Use defensive parsing, drawdown thresholds at 20/30/35, declared risk level, return consistency, theme concentration, data freshness, and a default non-network path when `options.aiProvider` is absent.

- [ ] **Step 4: Run service test to verify it passes**

Run: `npm test -- src/services/fundReportService.test.js`

Expected: PASS.

---

### Task 2: Report UI Integration

**Files:**
- Create: `src/components/FundReport.jsx`
- Modify: `src/pages/FundDetail.jsx`
- Modify: `src/App.test.jsx`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Write the failing page flow test**

Add this test to `src/App.test.jsx`:

```js
test('generates a single fund observation report from the detail page', async () => {
  renderRoute('/fund/515070');

  fireEvent.click(screen.getByRole('button', { name: '生成观察报告' }));

  expect(await screen.findByRole('heading', { name: '华夏中证人工智能主题ETF观察报告' })).toBeInTheDocument();
  expect(screen.getByText('综合风险判断')).toBeInTheDocument();
  expect(screen.getByText('数据说明与风险提示')).toBeInTheDocument();
  expect(screen.getByText(/不构成投资建议/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.jsx`

Expected: FAIL because the detail page has no report button.

- [ ] **Step 3: Implement component and page integration**

Create `FundReport.jsx` to render the report title, subtitle, risk band, generated time, data date, and all sections. Update `FundDetail.jsx` to import `generateFundReport` and `FundReport`, keep `report` in state, and render the action section after `DataStatus`.

- [ ] **Step 4: Add styles**

Add focused CSS for `.report-panel`, `.report-action`, `.report-button`, `.fund-report`, `.fund-report__meta`, `.fund-report__sections`, and `.fund-report__section`. Keep layout compact and responsive.

- [ ] **Step 5: Run page test to verify it passes**

Run: `npm test -- src/App.test.jsx`

Expected: PASS.

---

### Task 3: Full Verification

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run all tests**

Run: `npm test`

Expected: all test files pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: Vite build succeeds and writes `dist/`.

- [ ] **Step 3: Review git diff**

Run: `git diff -- src/services/fundReportService.js src/services/fundReportService.test.js src/components/FundReport.jsx src/pages/FundDetail.jsx src/App.test.jsx src/styles/global.css`

Expected: diff only includes the report feature and styling.

- [ ] **Step 4: Commit implementation**

```bash
git add src/services/fundReportService.js src/services/fundReportService.test.js src/components/FundReport.jsx src/pages/FundDetail.jsx src/App.test.jsx src/styles/global.css docs/superpowers/plans/2026-07-01-single-fund-report-agent.md
git commit -m "feat: add single fund report agent"
```
