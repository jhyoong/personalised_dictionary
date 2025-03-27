/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Ensure the data directory is copied to the build
    webpack: (config, { isServer }) => {
      if (isServer) {
        config.resolve.fallback = { fs: false };
      }
      return config;
    }
  }
  
  module.exports = nextConfig