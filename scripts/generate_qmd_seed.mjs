#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const root = process.cwd();
const outDir = path.join(root, 'docs/memory/qmd-prep/seed');
fs.mkdirSync(outDir, { recursive: true });

const files = [];
const addIf = (p) => { if (fs.existsSync(p)) files.push(p); };
const walk = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (st.isFile() && p.endsWith('.md')) files.push(p);
  }
};

addIf(path.join(root, 'MEMORY.md'));
walk(path.join(root, 'memory'));
walk(path.join(root, 'task-progress'));

const sourceFiles = [...new Set(files)].sort();
const out = { rules: [], progress: [], incidents: [] };
const seen = new Set();

const redact = (t) => t
  .replace(/(token|apikey|api_key|secret|password)\s*[:=]\s*[^\s\n]+/ig, '$1=[REDACTED_SECRET]')
  .replace(/\b(sk-[A-Za-z0-9_-]{10,})\b/g, '[REDACTED_SECRET]');

const splitChunks = (text) => text
  .split(/\n\s*\n+/)
  .map(s => s.trim())
  .filter(Boolean)
  .filter(s => !s.startsWith('```'));

const inferTier = (file) => {
  if (file.endsWith('/MEMORY.md')) return 'long_term';
  if (file.includes('/memory/topics/')) return 'topic';
  return 'daily';
};

const inferCat = (file, chunk) => {
  if (file.endsWith('/MEMORY.md')) return 'rules';
  if (file.includes('/task-progress/')) return 'progress';
  if (/规则|约定|必须|默认|gate|流程/i.test(chunk)) return 'rules';
  if (/进度|状态|DOING|PLAN|VERIFY|DONE|任务|milestone|commit|branch/i.test(chunk)) return 'progress';
  return 'incidents';
};

let id = 1;
for (const file of sourceFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  for (const c0 of splitChunks(raw)) {
    const text = redact(c0.replace(/\s+/g, ' ').trim());
    if (text.length < 20) continue;
    const rel = path.relative(root, file);
    const dedupe = crypto.createHash('sha256').update(text + '|' + rel).digest('hex').slice(0, 16);
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);

    const cat = inferCat(file, text);
    out[cat].push({
      id: `${cat}-${String(id++).padStart(5, '0')}`,
      text,
      source_file: rel,
      date: (file.match(/(\d{4}-\d{2}-\d{2})/) || [])[1] || null,
      topic: file.includes('/memory/topics/') ? path.basename(file, '.md') : null,
      tier: inferTier(file),
      sensitivity: 'internal',
      language: /[\u4e00-\u9fff]/.test(text) ? 'zh-CN' : 'en',
      tags: [cat, 'auto-sync'],
      dedupe_key: dedupe
    });
  }
}

for (const k of ['rules', 'progress', 'incidents']) {
  const p = path.join(outDir, `${k}.jsonl`);
  fs.writeFileSync(p, out[k].map(r => JSON.stringify(r)).join('\n') + '\n');
}

const report = {
  generated_at: new Date().toISOString(),
  source_files: sourceFiles.length,
  records: {
    rules: out.rules.length,
    progress: out.progress.length,
    incidents: out.incidents.length,
    total: out.rules.length + out.progress.length + out.incidents.length
  }
};
fs.writeFileSync(path.join(outDir, 'full-seed-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
