/**
 * Security Audit Script
 * Run with: npx tsx scripts/security-audit.ts
 *
 * Checks:
 * 1. No secrets in source code
 * 2. All tables have RLS enabled
 * 3. No service_role key in client code
 * 4. Environment variables are not hardcoded
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const DANGEROUS_PATTERNS = [
  /service_role/i,
  /sk_live_/,
  /secret_key/i,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /SUPABASE_SERVICE_ROLE/,
];

const EXCLUDED_DIRS = ['node_modules', '.git', '.expo', 'dist', 'scripts'];
const EXCLUDED_FILES = ['.env.example', '.env.local', 'SPEC.md', 'PROJECT_PLAN.md'];

let issues = 0;

function scanFile(filePath: string) {
  if (EXCLUDED_FILES.some((f) => filePath.endsWith(f))) return;
  if (!/\.(ts|tsx|js|jsx|json|sql)$/.test(filePath)) return;

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, i) => {
    DANGEROUS_PATTERNS.forEach((pattern) => {
      if (pattern.test(line)) {
        console.error(`  [FAIL] ${filePath}:${i + 1} — matches ${pattern}`);
        issues++;
      }
    });
  });
}

function scanDir(dir: string) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    if (EXCLUDED_DIRS.includes(entry)) continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else {
      scanFile(fullPath);
    }
  }
}

console.log('FindMyZyns Security Audit');
console.log('========================\n');

console.log('1. Scanning for secrets in source code...');
scanDir(process.cwd());

if (issues === 0) {
  console.log('  [PASS] No secrets found in source code\n');
} else {
  console.log(`  [FAIL] Found ${issues} potential secrets\n`);
}

console.log('2. Checking environment variable usage...');
const supabaseClient = readFileSync('lib/supabase.ts', 'utf-8');
if (supabaseClient.includes('process.env.EXPO_PUBLIC_')) {
  console.log('  [PASS] Supabase credentials loaded from environment\n');
} else {
  console.log('  [FAIL] Supabase credentials may be hardcoded\n');
  issues++;
}

console.log('3. Checking RLS migrations...');
const rlsMigration = readFileSync('supabase/migrations/00003_rls_policies.sql', 'utf-8');
const tables = ['profiles', 'products', 'connections', 'messages', 'shares'];
tables.forEach((table) => {
  if (rlsMigration.includes(`alter table public.${table} enable row level security`)) {
    console.log(`  [PASS] RLS enabled on ${table}`);
  } else {
    console.log(`  [FAIL] RLS NOT enabled on ${table}`);
    issues++;
  }
});

console.log('\n========================');
if (issues === 0) {
  console.log('ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log(`${issues} ISSUE(S) FOUND`);
  process.exit(1);
}
