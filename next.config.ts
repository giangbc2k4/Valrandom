const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,   // bỏ qua ESLint error
  },
  typescript: {
    ignoreBuildErrors: true,   // bỏ qua TypeScript error
  },
};

module.exports = nextConfig;
