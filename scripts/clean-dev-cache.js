/**
 * Removes Next.js dev artifacts that often corrupt on Windows (especially paths with spaces),
 * causing 404s for /_next/static/* (layout.css, main-app.js, etc.).
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
