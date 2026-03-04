# Task 2 Progress - Info Push App

Last updated: 2026-02-18 23:55 CST

## 2026-02-18

### ✅ Completed
- `35156d3` feat(task2): bootstrap info-push app scaffold and api mvp contract
  - Created `apps/info-push` scaffold (api/web/android/shared)
  - Added minimal API endpoints (`/health`, `/v1/feed`, `/v1/messages`, `/v1/preferences`, `/v1/push/trigger`)
  - Added initial MVP plan doc

- `970f374` feat(task2): add web message center mvp page wired to api
  - Added `apps/info-push/web/src/message-center.html`
  - Wired to API for message list + manual trigger

- `3ffd103` feat(task2): add ingestion dedupe and ranked feed refresh
  - Added ingestion pipeline (`apps/info-push/api/src/ingestion.js`)
  - Added dedupe + score ranking + `/v1/feed?refresh=1`

- `095a939` feat(task2): add preferences read endpoint and mvp smoke checklist
  - Added `GET /v1/preferences`
  - Added `apps/info-push/docs-smoke.md` acceptance checklist

- `84caaed` feat(task2): add feed preview panel to web message center mvp
  - Added feed preview section and refresh button in web MVP page

### ⏳ In Progress
- M1 second-stage polish: message center usability + API contract cleanup
- Prepare M2 kickoff: source expansion, stronger dedupe, ranking tuning

### 🚧 Current blockers
- No hard technical blocker
- Process blocker previously observed: progress-doc sync and branch isolation were missing (fixed now)

### ▶ Next step
- Next commit: refine web message center UX + keep docs/progress.md synced per commit

### 2026-02-19 00:06 CST micro-step
- Plan: add feed `limit` support and include active preferences in feed response for web rendering.
- Done: updated API feed endpoint with `limit` query support and returned current preferences payload.

### 2026-02-19 00:11 CST micro-step
- Plan: add message list `limit` support and unread count in messages response.
- Done: message API now supports `limit` query and returns `unreadCount` for UI badge rendering.

### 2026-02-19 00:49 CST micro-step
- Plan: add GitHub source adapter endpoint for latest AI repositories with token-ready auth header support.
- Done: added GitHub latest endpoint (`/v1/sources/github/latest`) and token-ready fetch flow with local fallback sample data.

### 2026-02-19 09:13 CST hotfix-step
- Plan: deliver immediate web-acceptance page for GitHub AI latest feed and message center linkage.
- Done: added `github-acceptance.html` page to render `/v1/sources/github/latest` and quick trigger `/v1/push/trigger` for验收.

### 2026-02-19 09:15 CST deploy-step
- Plan: expose acceptance web URL and API via nginx reverse proxy for immediate user verification.
- Done: acceptance page switched to relative `/info-api`; added lightweight static web server for `apps/info-push/web/src`; nginx routes `/info-push/` and `/info-api/` now available.

### 2026-02-19 09:20 CST feature-step
- Plan: add GitHub hot/trending projects endpoint and render project简介 in acceptance page.
- Done: added `/v1/sources/github/trending` (stars-desc) and updated web acceptance page with hot-project toggle + explicit summary block.

### 2026-02-19 09:22 CST requirement-fix
- Plan: align acceptance page default behavior to GitHub 热门项目 priority.
- Done: changed acceptance page default load from latest -> trending and updated UI labels to emphasize 热门项目.

### 2026-02-19 09:26 CST ui-fix
- Plan: show project summary in Chinese on acceptance page.
- Done: added Chinese summary rendering (`简介（中文）`) with auto-wrap for non-Chinese descriptions.

### 2026-02-19 09:28 CST translation-fix
- Plan: fully translate GitHub project summaries into Chinese instead of partial wrapper text.
- Done: added summary translation pipeline (Google public translate endpoint + fallback) and switched UI to prefer `summaryZh`.

### 2026-02-19 09:28 CST i18n-toggle-step
- Plan: add language toggle button on acceptance page for Chinese/English switching.
- Done: added `中/EN` toggle; supports UI labels and project summary display switching (summaryZh/summary).

### 2026-02-19 09:38 CST source-discovery-step
- Plan: add web source-management flow with AI discovery + manual confirm add.
- Done: added AI discover API, source add/list API, and frontend source panel (discover candidates + one-click add).

### 2026-02-19 09:42 CST source-ui-fix
- Plan: fix source add UX not reflecting immediately and provide clickable source-content action.
- Done: after add, UI now updates immediately with success status; added explicit “查看内容/Visit” buttons in candidate and added-source cards.

### 2026-02-19 09:49 CST sources-management-step
- Plan: implement standalone source management capability with CRUD + enable/disable + source-item viewing APIs.
- Done: added source CRUD/enable-disable/items/collect endpoints and created dedicated `sources.html` management page with clickable source item viewing.

### 2026-02-19 09:53 CST sources-page-flow-adjust
- Plan: move AI source discovery into dedicated sources page; remove manual collect button and auto-collect on view.
- Done: added AI discover + candidate confirm-add UI in `sources.html`; removed collect button; clicking "查看条目" now auto-triggers collect then displays latest items.

### 2026-02-19 09:56 CST bugfix-persistence
- Plan: fix "查看无条目" root cause by persisting sources/items state and default-enabling legacy sources.
- Done: added local JSON persistence for sources/items/preferences and normalized legacy source `enabled=true` to avoid auto-collect skip.

### 2026-02-19 10:00 CST source-validation-step
- Plan: enforce source probe on add and mark add-failure when source cannot fetch real items.
- Done: source add now probes real items (github/rss/reddit-rss); failed probes return add-failure; sources page now displays add-failure details and collect-failure details.

### 2026-02-19 10:03 CST navbar-step
- Plan: add top navigation bar for quick page switching between acceptance and sources management pages.
- Done: added shared top nav bar to `github-acceptance.html` and `sources.html` with active-page highlighting and direct links.

### 2026-02-19 10:08 CST home-sources-ui-step
- Plan: remove source-search from home page; show added sources as clickable buttons that auto-refresh corresponding source content.
- Done: home page removed source-search/add UI; now renders added sources as buttons from `/v1/sources/home`; click button auto-collects and displays corresponding source items.

### 2026-02-19 10:15 CST discovery-relevance-fix
- Plan: make source discovery query-aware (not AI-only) and ensure non-AI sources (e.g. finance) map to matching GitHub topics.
- Done: discovery fallback now uses dynamic topic inference + broader source pool; GitHub source collection now follows source topic/keyword instead of hardcoded AI.

### 2026-02-19 10:18 CST finance-discovery-fix
- Plan: fix finance-query source discovery diversity (not github-only).
- Done: added Chinese/English token expansion for domain synonyms (finance/market/investing etc.), enabling RSS/social finance sources to be scored and returned.

### 2026-02-19 11:05 CST source-volume-step
- Plan: increase discovered source count and improve query expansion for richer results.
- Done: discovery default limit raised to 20; expanded token synonyms (finance/crypto/AI); added dynamic Google News RSS source injection by query.

### 2026-02-19 11:10 CST source-pool-expand-step
- Plan: expand source pool size and diversity for broader discovery results.
- Done: expanded built-in source catalog (github/rss/social) and added dynamic Google News CN + Reddit search sources, increasing candidate diversity for non-AI queries.

### 2026-02-19 11:48 CST favorites-step
- Plan: add favorites button for feed items and create dedicated favorites page sorted by latest favorite time.
- Done: added favorites APIs (`GET/POST/DELETE /v1/favorites`), added 收藏按钮 on home/source item cards, and created `/info-push/favorites.html` page (latest-first with remove action).
