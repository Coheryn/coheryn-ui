/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@coheryn/coherynui-react', '@coheryn/coherynui-motion', '@coheryn/coherynui-tokens', '@coheryn/coherynui-components'],
};

module.exports = nextConfig;
