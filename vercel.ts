import type { VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  buildCommand: 'pnpm --filter @workspace/listlens run build',
  outputDirectory: 'artifacts/listlens/dist/public',
};
