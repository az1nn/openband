const fs = require('fs');
const path = require('path');

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

fs.copyFileSync('assets/sw.js', 'dist/sw.js');
fs.copyFileSync('assets/manifest.json', 'dist/manifest.json');

fs.mkdirSync('dist/assets', { recursive: true });

const icons = ['icon-192.png', 'icon-512.png', 'favicon.png'];
icons.forEach(f => {
  fs.copyFileSync(path.join('assets', f), path.join('dist/assets', f));
});

const wasmSource = path.join('wasm', 'dist', 'openband-plugin.wasm');
const wasmAsset = path.join('assets', 'openband-plugin.wasm');
const wasmTargets = [wasmSource, wasmAsset].filter(f => fs.existsSync(f));
if (wasmTargets.length) {
  fs.copyFileSync(wasmTargets[0], path.join('dist/assets', 'openband-plugin.wasm'));
  console.log('Copied openband-plugin.wasm into dist/assets');
} else {
  console.log('No openband-plugin.wasm found to copy (run `npm run build:wasm` first)');
}

const htmlPath = path.join('dist', 'index.html');
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');

  const entryDir = path.join('dist', '_expo', 'static', 'js', 'web');
  let entryFile = null;
  if (fs.existsSync(entryDir)) {
    const entryFiles = fs.readdirSync(entryDir).filter(f => f.startsWith('entry-') && f.endsWith('.js'));
    entryFile = entryFiles.length ? entryFiles[0] : null;
  }

  if (entryFile) {
    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const HEAD_OPEN = '<!-- post-export:performance -->';
    const HEAD_CLOSE = '<!-- /post-export:performance -->';
    const SPLASH_OPEN = '<!-- post-export:splash -->';
    const SPLASH_CLOSE = '<!-- /post-export:splash -->';

    const removeBlock = (doc, open, close) =>
      doc.replace(new RegExp('\\s*' + escapeRegExp(open) + '[\\s\\S]*?' + escapeRegExp(close) + '\\s*'), '');

    html = removeBlock(html, HEAD_OPEN, HEAD_CLOSE);
    html = removeBlock(html, SPLASH_OPEN, SPLASH_CLOSE);

    const headLinks = [
      '<link rel="preload" as="script" href="/_expo/static/js/web/' + entryFile + '">',
      '<link rel="preconnect" href="https://unpkg.com">',
      '<link rel="preconnect" href="https://cdnjs.cloudflare.com">',
      '<link rel="preconnect" href="https://cdn.jsdelivr.net">',
      '<link rel="dns-prefetch" href="https://unpkg.com">',
      '<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">',
      '<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">',
    ];
    const headBlock =
      '  ' + HEAD_OPEN + '\n' +
      headLinks.map(l => '  ' + l).join('\n') + '\n' +
      '  ' + HEAD_CLOSE + '\n' +
      '</head>';
    html = html.replace('</head>', headBlock);

    const splashBlock =
      '<div id="root">\n' +
      '  ' + SPLASH_OPEN + '\n' +
      '  <div style="position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:#0a0a0d;color:#8e8e93;font-family:system-ui,-apple-system,Segoe UI,sans-serif">\n' +
      '    <div style="width:38px;height:38px;border:3px solid rgba(255,255,255,0.12);border-top-color:#ff3b30;border-radius:50%;animation:post-export-spin 1s linear infinite"></div>\n' +
      '    <div style="font-size:14px;letter-spacing:0.5px">OpenBand</div>\n' +
      '  </div>\n' +
      '  <style>@keyframes post-export-spin{to{transform:rotate(360deg)}}</style>\n' +
      '  ' + SPLASH_CLOSE + '\n' +
      '</div>';
    html = html.replace('<div id="root"></div>', splashBlock);

    fs.writeFileSync(htmlPath, html);
    console.log('Injected preload/preconnect/splash into dist/index.html (entry: ' + entryFile + ')');
  } else {
    console.log('No entry JS found in ' + entryDir + '; skipping HTML injection');
  }
} else {
  console.log('dist/index.html not found; skipping HTML injection');
}

console.log('Post-export assets copied successfully!');
