/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugvmkzxnqglneuejcskm.supabase.co",
        pathname: "/storage/v1/object/public/pictures/**",
      },
    ],
  },
  turbopack: {
    root: "/home/tim/Documents/Hobby/HireHive"
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
                default-src 'self' https:; 
                script-src 'self' https://cdn.jsdelivr.net; 
                style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; 
                img-src 'self' data: https:; 
                connect-src 'self' https://*.supabase.co https://nominatim.openstreetmap.org;
            `.replace(/\s{2,}/g, ' ').trim()
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

