import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Configuração de Rewrites (Redireciona o tráfego /api para o Python)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/index.py",
      },
    ];
  },

  // 2. Configuração de Headers (Segurança e CSP)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://i.scdn.co https://mosaic.scdn.co https://image-cdn-ak.spotifycdn.com https://image-cdn-fa.spotifycdn.com https://lineup-images.scdn.co",
              "connect-src 'self' http://localhost:3001 http://127.0.0.1:3001 http://localhost:8000 http://127.0.0.1:8000",
              "frame-src 'none'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;