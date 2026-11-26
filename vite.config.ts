import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ and prepares GitHub Pages static fallbacks.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(import.meta.dirname, 'dist');
          const srcAssets = path.resolve(import.meta.dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
          if (fs.existsSync(distDir)) {
            fs.writeFileSync(path.resolve(distDir, '.nojekyll'), '', 'utf8');
            const fallbackHtml = path.resolve(distDir, '404.html');
            fs.writeFileSync(
              fallbackHtml,
              `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CandyGame</title>
    <script>
      (function () {
        var repoBase = '/candyteam';
        var path = window.location.pathname || '/';
        var basePrefix = '';
        if (path === repoBase || path.indexOf(repoBase + '/') === 0) {
          basePrefix = repoBase;
          path = path.slice(repoBase.length) || '/';
        }
        if (path.charAt(0) !== '/') path = '/' + path;
        var target = path + (window.location.search || '');
        window.location.replace(window.location.origin + basePrefix + '/#' + target);
      })();
    </script>
  </head>
  <body style="background:#151123;color:#e7defa;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
    Redirecting to CandyGame...
  </body>
</html>
`,
              'utf8'
            );
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
