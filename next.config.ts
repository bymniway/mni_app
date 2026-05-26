import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sdouuctsicuhynnzdoow.supabase.co', // Mengizinkan semua gambar dari Supabase
      },
      {
        protocol: 'https',
        hostname: '**.aliyuncs.com', // Izin untuk Alibaba
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Izin untuk Firebase
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Izin untuk Cloudinary
      },
      // {
      //   protocol: 'https',
      //   hostname: 'pub-f3368273148343ed891b677a80ef88d7.r2.dev', // Mengizinkan semua gambar dari r2 cloudflare
      // },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
};

export default nextConfig;
