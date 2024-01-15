const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, child_process: false };
    return config;
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "gaslite",
    project: "gaslite-drop",
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  }
);
