# Fund Recommendation Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive Chinese fund recommendation website with mock theme-driven fund data, search, filtering, fund detail routing, and visible investment risk notices.

**Architecture:** Create a standalone Vite React app in `fund-recommendation-site`. Keep data and filtering logic in focused modules, render pages through React Router, and style with plain CSS media queries.

**Tech Stack:** React, Vite, React Router, Vitest, Testing Library, plain CSS.

---

### Task 1: Project Scaffold And Tests

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/utils/filterFunds.test.js`
- Create: `src/data/funds.test.js`

- [ ] Create package and test configuration.
- [ ] Write failing tests for mock data coverage and filtering behavior.
- [ ] Run tests and confirm they fail because implementation files are missing.

### Task 2: Data And Filtering Logic

**Files:**
- Create: `src/data/funds.js`
- Create: `src/utils/filterFunds.js`

- [ ] Add at least 12 mock funds covering AI, semiconductor, new energy, robotics, medicine, consumption, gold, military, and low-altitude economy.
- [ ] Implement case-insensitive fuzzy search by fund name/code and combined topic filtering.
- [ ] Run tests and confirm they pass.

### Task 3: React Pages And Components

**Files:**
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/pages/Home.jsx`
- Create: `src/pages/FundDetail.jsx`
- Create: `src/components/SearchBar.jsx`
- Create: `src/components/HotTopicTabs.jsx`
- Create: `src/components/FundCard.jsx`
- Create: `src/components/FundList.jsx`
- Create: `src/components/RiskNotice.jsx`
- Create: `src/components/EmptyState.jsx`
- Create: `src/components/LoadingState.jsx`

- [ ] Wire routes `/` and `/fund/:code`.
- [ ] Build search, hot topic tabs, card list, empty state, and detail page behavior.
- [ ] Include risk notices on home and detail pages.

### Task 4: Responsive Styling And Verification

**Files:**
- Create: `src/styles/global.css`

- [ ] Add modern fintech styling with clear hierarchy and Chinese-friendly typography.
- [ ] Add desktop grid and mobile single-column layout.
- [ ] Install dependencies, run tests, run build, start dev server, and verify the app loads.
