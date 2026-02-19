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
