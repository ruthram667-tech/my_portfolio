import { build } from 'esbuild';

await build({
  entryPoints: ['src/server.ts'],
  outfile: 'dist/server.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  sourcemap: true,
  packages: 'external',
  // bundle the workspace package (TypeScript source) into the output
  plugins: [
    {
      name: 'bundle-shared',
      setup(b) {
        b.onResolve({ filter: /^@portfolio\/shared$/ }, () => ({ path: new URL('../../../packages/shared/src/index.ts', import.meta.url).pathname }));
      },
    },
  ],
});
console.log('api built -> dist/server.js');
