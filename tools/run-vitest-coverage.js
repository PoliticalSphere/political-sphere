#!/usr/bin/env node
// Programmatic Vitest runner that reliably enables coverage and writes a ranked JSON
// This uses Vitest's Node API so we avoid CLI flag/reporting inconsistencies.
import fs from 'fs';
import path from 'path';

console.log('Running Vitest (programmatic runner) to produce coverage artifacts...');

async function main() {
  // lazy import startVitest which accepts CLI-like args
  const { startVitest } = await import('vitest/node');

  // invoke startVitest with CLI-like args to enable coverage on the specific test folder
  // this mirrors: vitest --run --coverage "apps/api/src/__tests__/**"
  const exitCode = await startVitest(['--run', '--coverage', 'apps/api/src/__tests__/**']);

  // After run completes, look for coverage JSON
  const coveragePath = path.resolve(process.cwd(), 'coverage', 'coverage-final.json');
  if (!fs.existsSync(coveragePath)) {
    console.error('No coverage file found at', coveragePath);
    // still exit with Vitest's exit code
    process.exit(exitCode || 1);
  }

  console.log('Found coverage file:', coveragePath);
  const raw = fs.readFileSync(coveragePath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse coverage JSON:', err);
    process.exit(1);
  }

  // Build a ranked list of files by statements coverage
  const files = Object.keys(data).map((file) => {
    const metrics = data[file];
    const stm = metrics.s || {};
    const total = Object.keys(stm).length;
    const covered = Object.values(stm).filter((v) => v > 0).length;
    const pct = total === 0 ? 100 : Math.round((covered / total) * 10000) / 100;
    return { file, total, covered, pct };
  });

  files.sort((a, b) => a.pct - b.pct);

  const outPath = path.resolve(process.cwd(), 'reports', 'coverage-ranked.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(files, null, 2));
  console.log('Wrote ranked coverage to', outPath);

  // exit cleanly; startVitest may return a complex object rather than a numeric code
  process.exit(0);
}

main().catch((err) => {
  console.error('Runner failed:', err);
  process.exit(2);
});
