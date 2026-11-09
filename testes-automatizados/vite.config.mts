import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const front = path.resolve(root, '../frontend');
const pkg = JSON.parse(readFileSync(path.join(front, 'package.json'), 'utf8'));
export default defineConfig({
  root: front,
  cacheDir: path.join(root, '.cache/vite'),
  plugins: [
    { name: 'test-package-dependencies', enforce: 'pre', async resolveId(source, importer) {
      if (Object.keys(pkg.dependencies).some(name => source === name || source.startsWith(`${name}/`))) {
        return this.resolve(source, path.join(root, 'index.html'), { skipSelf: true });
      }
    } },
    react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss(),
  ],
  define: { 'import.meta.env.VITE_API_URL': JSON.stringify(process.env.API_URL || 'http://127.0.0.1:4300') },
  resolve: { alias: [
    { find: '@', replacement: path.join(front, 'src') },
    { find: 'react', replacement: path.join(root, 'node_modules/react') },
    { find: 'react-dom', replacement: path.join(root, 'node_modules/react-dom') },
    { find: /^tailwindcss$/, replacement: path.join(root, 'node_modules/tailwindcss/index.css') },
    { find: /^tw-animate-css$/, replacement: path.join(root, 'node_modules/tw-animate-css/dist/tw-animate.css') },
    { find: /^shadcn\/tailwind.css$/, replacement: path.join(root, 'node_modules/shadcn/dist/tailwind.css') },
  ] },
  server: { host: '127.0.0.1', port: 4173, strictPort: true, fs: { allow: [path.resolve(root, '..')] } },
});
