import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['tasks/TagReleaseForGit/src/index.ts'],
  format: ['cjs'],
  target: 'node16',
  platform: 'node',
  dts: false,
  clean: true,
  bundle: true,
  sourcemap: true,
  external: ['azure-pipelines-task-lib'],
  outDir: 'tasks/TagReleaseForGit/dist',
  outExtension: () => ({ js: '.js' }),
});
