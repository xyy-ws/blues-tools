# Habit MVP (Web + Light Backend) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a usable MVP habit app (Web/PWA) with local-first check-ins, browser+in-app reminders, and anonymous cloud backup/recovery.

**Architecture:** Monorepo with `apps/web` (React + Vite + PWA) and `apps/api` (Node + Fastify + SQLite). Web writes locally first (IndexedDB), then syncs ops to API. API stores device-scoped data with recovery code support and operation-log-based sync.

**Tech Stack:** TypeScript, React, Vite, vite-plugin-pwa, Dexie, Zustand, Fastify, better-sqlite3, Zod, Vitest, Playwright, Supertest

---

### Task 1: Monorepo bootstrap

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `apps/web/package.json`
- Create: `apps/api/package.json`

**Step 1: Write the failing test**
```json
// package.json (root)
{
  "name": "habit-mvp",
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "test": "echo 'tests not configured yet' && exit 1"
  }
}
```

**Step 2: Run test to verify it fails**
Run: `pnpm test`
Expected: FAIL with exit code 1.

**Step 3: Write minimal implementation**
- Replace root scripts with real workspace scripts (`test:web`, `test:api`, `test`).
- Add app package manifests with `dev`, `build`, `test` scripts.

**Step 4: Run test to verify it passes**
Run: `pnpm -r test --if-present`
Expected: PASS or no-test exits cleanly.

**Step 5: Commit**
```bash
git add package.json pnpm-workspace.yaml .gitignore apps/web/package.json apps/api/package.json
git commit -m "chore: bootstrap monorepo for habit mvp"
```

### Task 2: API skeleton + health endpoint

**Files:**
- Create: `apps/api/src/server.ts`
- Create: `apps/api/src/routes/health.ts`
- Create: `apps/api/test/health.test.ts`

**Step 1: Write the failing test**
```ts
// apps/api/test/health.test.ts
import { buildServer } from '../src/server';
import { describe, it, expect } from 'vitest';

describe('GET /health', () => {
  it('returns ok', async () => {
    const app = buildServer();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
  });
});
```

**Step 2: Run test to verify it fails**
Run: `pnpm --filter @habit/api test health.test.ts`
Expected: FAIL (missing server or route).

**Step 3: Write minimal implementation**
```ts
// apps/api/src/routes/health.ts
export async function healthRoute(app:any){
  app.get('/health', async () => ({ ok: true }));
}
```

**Step 4: Run test to verify it passes**
Run: `pnpm --filter @habit/api test health.test.ts`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/api/src apps/api/test
git commit -m "feat(api): add health route and server bootstrap"
```

### Task 3: Device registration + recovery code

**Files:**
- Create: `apps/api/src/routes/devices.ts`
- Create: `apps/api/src/lib/recovery.ts`
- Create: `apps/api/test/devices.test.ts`

**Step 1: Write the failing test**
- POST `/devices/register` returns `{ deviceId, recoveryCode }`
- POST `/devices/recover` with code returns same device scope.

**Step 2: Run test to verify it fails**
Run: `pnpm --filter @habit/api test devices.test.ts`
Expected: FAIL 404 or schema errors.

**Step 3: Write minimal implementation**
- Add SQLite `devices` table.
- Generate human-friendly recovery code (`XXXX-XXXX-XXXX`).
- Store only hash in DB.

**Step 4: Run test to verify it passes**
Run: `pnpm --filter @habit/api test devices.test.ts`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/api/src/routes/devices.ts apps/api/src/lib/recovery.ts apps/api/test/devices.test.ts
git commit -m "feat(api): add anonymous device register and recovery"
```

### Task 4: Habit CRUD API

**Files:**
- Create: `apps/api/src/routes/habits.ts`
- Create: `apps/api/test/habits.test.ts`

**Step 1: Write the failing test**
- `POST /habits` create.
- `GET /habits?deviceId=...` list.
- `PATCH /habits/:id` update target/mode.

**Step 2: Run test to verify it fails**
Run: `pnpm --filter @habit/api test habits.test.ts`
Expected: FAIL missing routes.

**Step 3: Write minimal implementation**
- Add `habits` table.
- Validate mode `A|B|C|D`, target_type `once|count|duration`.
- Scope all records by `device_id`.

**Step 4: Run test to verify it passes**
Run: `pnpm --filter @habit/api test habits.test.ts`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/api/src/routes/habits.ts apps/api/test/habits.test.ts
git commit -m "feat(api): implement device-scoped habits crud"
```

### Task 5: Check-in append-only API (no overwrite)

**Files:**
- Create: `apps/api/src/routes/checkins.ts`
- Create: `apps/api/test/checkins.test.ts`

**Step 1: Write the failing test**
- POST `/checkins` appends a record.
- Same habit/date can have multiple records; API returns aggregated daily total in read endpoint.

**Step 2: Run test to verify it fails**
Run: `pnpm --filter @habit/api test checkins.test.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Add `checkins` table append-only.
- Add `GET /checkins/daily` with aggregate.

**Step 4: Run test to verify it passes**
Run: `pnpm --filter @habit/api test checkins.test.ts`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/api/src/routes/checkins.ts apps/api/test/checkins.test.ts
git commit -m "feat(api): add append-only checkins and daily aggregate"
```

### Task 6: Sync ops endpoint + conflict policy

**Files:**
- Create: `apps/api/src/routes/sync.ts`
- Create: `apps/api/test/sync.test.ts`

**Step 1: Write the failing test**
- POST `/sync/push` accepts op list and is idempotent by `op_id`.
- GET `/sync/pull` returns ops since cursor.

**Step 2: Run test to verify it fails**
Run: `pnpm --filter @habit/api test sync.test.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**
- `sync_ops` table.
- `habits/reminders` apply LWW using `updated_at`.
- `checkins` remain append-only.

**Step 4: Run test to verify it passes**
Run: `pnpm --filter @habit/api test sync.test.ts`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/api/src/routes/sync.ts apps/api/test/sync.test.ts
git commit -m "feat(api): add op-log sync with idempotency and lww policy"
```

### Task 7: Web app shell + routing + local DB

**Files:**
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/app/router.tsx`
- Create: `apps/web/src/db/indexedDb.ts`
- Create: `apps/web/src/pages/Dashboard.tsx`
- Create: `apps/web/test/smoke.test.tsx`

**Step 1: Write the failing test**
- Render app and assert dashboard title exists.

**Step 2: Run test to verify it fails**
Run: `pnpm --filter @habit/web test smoke.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**
- App shell with 5 routes: Dashboard, Habits, CheckinDetail, Insights, Settings.
- Dexie schema for local `habits`, `checkins`, `ops`.

**Step 4: Run test to verify it passes**
Run: `pnpm --filter @habit/web test smoke.test.tsx`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/web/src apps/web/test
git commit -m "feat(web): scaffold app shell routes and local db"
```

### Task 8: Habit configuration UI (mode + target type)

**Files:**
- Create: `apps/web/src/pages/Habits.tsx`
- Create: `apps/web/src/components/HabitEditor.tsx`
- Create: `apps/web/test/habit-editor.test.tsx`

**Step 1: Write the failing test**
- User can choose mode A/B/C/D.
- User can choose target type once/count/duration.

**Step 2: Run test to verify it fails**
Run: `pnpm --filter @habit/web test habit-editor.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Form with validation and save to IndexedDB.
- Queue sync op after save.

**Step 4: Run test to verify it passes**
Run: `pnpm --filter @habit/web test habit-editor.test.tsx`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/web/src/pages/Habits.tsx apps/web/src/components/HabitEditor.tsx apps/web/test/habit-editor.test.tsx
git commit -m "feat(web): add habit editor with mode and target rules"
```

### Task 9: Check-in flows (one-tap/count/timer)

**Files:**
- Create: `apps/web/src/components/CheckinCard.tsx`
- Create: `apps/web/src/lib/timer.ts`
- Create: `apps/web/test/checkin-flows.test.tsx`

**Step 1: Write the failing test**
- once: single tap marks done.
- count: increments toward target.
- duration: timer start/stop writes minutes.

**Step 2: Run test to verify it fails**
Run: `pnpm --filter @habit/web test checkin-flows.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Implement all 3 flows.
- Persist append-only checkin records locally.

**Step 4: Run test to verify it passes**
Run: `pnpm --filter @habit/web test checkin-flows.test.tsx`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/web/src/components/CheckinCard.tsx apps/web/src/lib/timer.ts apps/web/test/checkin-flows.test.tsx
git commit -m "feat(web): implement checkin flows for once count duration"
```

### Task 10: Dashboard metrics + Habit Health Score v1

**Files:**
- Create: `apps/web/src/lib/score.ts`
- Modify: `apps/web/src/pages/Dashboard.tsx`
- Create: `apps/web/test/score.test.ts`

**Step 1: Write the failing test**
- Score uses 50/30/20 weights.
- First 7 days limits day-over-day swing (e.g. max ±8).

**Step 2: Run test to verify it fails**
Run: `pnpm --filter @habit/web test score.test.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Implement score function and explanations.
- Render primary card: Habit Health Score.
- Render secondary: today completion, streak, weekly trend.

**Step 4: Run test to verify it passes**
Run: `pnpm --filter @habit/web test score.test.ts`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/web/src/lib/score.ts apps/web/src/pages/Dashboard.tsx apps/web/test/score.test.ts
git commit -m "feat(web): add dashboard metrics and health score v1"
```

### Task 11: Reminders (browser + in-app fallback)

**Files:**
- Create: `apps/web/src/lib/notifications.ts`
- Create: `apps/web/src/components/InAppReminderCenter.tsx`
- Create: `apps/web/test/reminders.test.tsx`

**Step 1: Write the failing test**
- If Notification denied, in-app reminder still appears.
- If app opened after missed reminder, show catch-up alert.

**Step 2: Run test to verify it fails**
Run: `pnpm --filter @habit/web test reminders.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Permission handling.
- In-app queue for missed reminders.
- Settings toggles for browser and in-app channels.

**Step 4: Run test to verify it passes**
Run: `pnpm --filter @habit/web test reminders.test.tsx`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/web/src/lib/notifications.ts apps/web/src/components/InAppReminderCenter.tsx apps/web/test/reminders.test.tsx
git commit -m "feat(web): add dual-channel reminders with catch-up fallback"
```

### Task 12: Backup/export/import + recovery UX

**Files:**
- Create: `apps/web/src/pages/Settings.tsx`
- Create: `apps/web/src/lib/backup.ts`
- Create: `apps/web/test/backup.test.ts`

**Step 1: Write the failing test**
- Export generates JSON containing habits/checkins/ops.
- Import dedupes by `op_id` first, then business key.

**Step 2: Run test to verify it fails**
Run: `pnpm --filter @habit/web test backup.test.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**
- JSON export/import.
- Recovery code display with explicit warning and confirm flow.

**Step 4: Run test to verify it passes**
Run: `pnpm --filter @habit/web test backup.test.ts`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/web/src/pages/Settings.tsx apps/web/src/lib/backup.ts apps/web/test/backup.test.ts
git commit -m "feat(web): add backup import export and recovery safeguards"
```

### Task 13: End-to-end happy-path test + release checklist

**Files:**
- Create: `apps/web/e2e/happy-path.spec.ts`
- Create: `docs/plans/2026-02-16-habit-mvp-release-checklist.md`

**Step 1: Write the failing test**
- Create habit -> check in -> see score update -> export backup.

**Step 2: Run test to verify it fails**
Run: `pnpm --filter @habit/web exec playwright test apps/web/e2e/happy-path.spec.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Stabilize selectors/test ids.
- Fix blocking regressions only.

**Step 4: Run test to verify it passes**
Run: `pnpm --filter @habit/web exec playwright test apps/web/e2e/happy-path.spec.ts`
Expected: PASS.

**Step 5: Commit**
```bash
git add apps/web/e2e/happy-path.spec.ts docs/plans/2026-02-16-habit-mvp-release-checklist.md
git commit -m "test: add e2e happy path and mvp release checklist"
```

## Verification gate (before claiming done)

Run:
```bash
pnpm -r test
pnpm --filter @habit/web build
pnpm --filter @habit/api test
```
Expected: all green.

## Out of scope for MVP
- Native mobile app packaging
- Social features and leaderboards
- Third-party sensor integration (Apple Health / Google Fit)
- Paid plans and billing
