import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins:['10.10.1.174'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          }
        ],
      },
    ];
  },
};

export default nextConfig;
