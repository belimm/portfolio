import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
   // Small self-contained server for the Docker image (Coolify). Ignored by Vercel.
   output: 'standalone',
};

export default nextConfig;
