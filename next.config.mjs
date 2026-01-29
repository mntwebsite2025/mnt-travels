/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [new URL(process.env.APP_URL).hostname],
   
  },
  devIndicators: false,
}

export default nextConfig
