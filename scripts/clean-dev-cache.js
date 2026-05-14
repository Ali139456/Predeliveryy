/**
 * Removes Next.js dev artifacts that often corrupt on Windows (especially paths with spaces).
 *
 * Symptoms: "Cannot find module './NNNN.js'", missing /_next/static/*, stale HMR after edits.
 * Cause: webpack splits server/client into numbered chunks; after crashes, branch switches, or
 * mixed turbo/webpack runs, .next can reference chunk IDs that no longer exist (common on Windows,
 * especially paths with spaces). Default dev uses Turbopack (`npm run dev`) to avoid webpack dev chunks.
 *
 * Fix: stop `npm run dev`, run `npm run clean:next`, then `npm run dev` again.
 * If you use webpack dev (`npm run dev:webpack`), run `clean:next` after chunk errors.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function rm(target) {
  const p = path.join(root, ...target.split('/'));
  try {
    fs.rmSync(p, { recursive: true, force: true });
    console.log('[clean-dev-cache] removed', path.relative(root, p));
  } catch (e) {
    if (e.code !== 'ENOENT') console.warn('[clean-dev-cache]', p, e.message);
  }
}

rm('.next');
rm('node_modules/.cache');
rm('.turbo');
