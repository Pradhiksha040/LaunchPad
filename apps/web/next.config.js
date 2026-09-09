/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@launchpad/ui', '@launchpad/shared', '@launchpad/connectors', '@launchpad/sdk'],
  reactStrictMode: true,
};

module.exports = nextConfig;
