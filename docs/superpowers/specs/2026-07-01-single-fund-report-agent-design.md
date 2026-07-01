# Single Fund Report Agent Design

## Goal

Add a single-fund observation report feature to the existing fund recommendation site. On a fund detail page, the user can generate a structured Chinese report that reads fund data, analyzes risk, and summarizes observation points. The first version uses deterministic rules and reserves a clean extension point for future AI-generated wording.

## Scope

This feature covers one fund at a time. It will be available from the existing fund detail page and will use the fund object already loaded by that page, including live estimate data, historical performance, maximum drawdown, risk level, holdings, hot tags, and local descriptive fields.

The feature will not provide buy, sell, target price, or allocation recommendations. It will use neutral observation language and keep a visible risk notice.

## User Experience

The fund detail page will include a report section with a primary action such as "生成观察报告". Before generation, the section shows a compact empty state. After generation, it shows a structured report with:

- 综合风险判断
- 收益表现解读
- 回撤与波动提示
- 主题集中度提示
- 观察建议
- 数据说明与风险提示

The report should feel like a practical observation assistant, not a sales recommendation. If live data is incomplete, the report still renders with available local data and clearly marks missing fields.

## Architecture

The implementation will use a small, testable report engine instead of putting analysis logic directly into the page.

- `src/services/fundReportService.js` will generate the report model from a fund object.
- `src/components/FundReport.jsx` will render the report model.
- `src/pages/FundDetail.jsx` will own the user interaction: button state, generated report state, and placement on the page.

The service will expose a function similar to `generateFundReport(fund, options)`. The `options` shape will reserve an `aiProvider` extension point, but the default behavior will not call an external AI service or require an API key.

## Risk Analysis Rules

The rule engine will combine qualitative and numeric signals:

- Original risk level from the fund data.
- Maximum drawdown thresholds, especially around 20%, 30%, and 35%.
- Short and medium return consistency from 1-month, 3-month, 6-month, and 1-year returns when available.
- Theme concentration from holdings and hot tags.
- Data freshness from `performanceAsOf`, `estimateTime`, or `navDate`.

The result will include a risk band, a short explanation, and a list of observation points. Percent values will be parsed defensively so missing, malformed, or placeholder values do not break the report.

## Data Flow

1. `FundDetail.jsx` loads the fund through the existing `loadFund(code)` flow.
2. The user clicks the report action.
3. `generateFundReport(fund)` returns a structured report object.
4. `FundReport.jsx` renders the report with accessible headings and compact sections.
5. If future AI generation is enabled, the same service boundary can call an `aiProvider` after the deterministic metrics are calculated.

## Error Handling

The report service will tolerate missing numeric fields and return useful fallback explanations. The UI will not fail if live APIs are unavailable, because it can use the existing local fund data. If no fund object exists, the detail page keeps the existing not-found flow.

## Testing

Add focused Vitest coverage for:

- Percent parsing and defensive handling of missing values.
- Risk band classification for low, medium, high drawdown examples.
- Report generation shape and required Chinese sections.
- Detail page rendering of the report action and generated report content.

Existing tests such as `npm test` and `npm run build` should pass before completion.

## Constraints

The feature must follow the current React/Vite structure and avoid introducing a new framework. It should keep financial language neutral and preserve risk disclosure. The first version must not require network access beyond the existing fund data loading flow and must not require an AI API key.
