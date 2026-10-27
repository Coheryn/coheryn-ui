/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@coherynui/react', '@coherynui/motion', '@coherynui/tokens', '@coherynui/components'],
};

module.exports = nextConfig;
