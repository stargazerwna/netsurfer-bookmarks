/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/command.php', destination: '/api/sitebar/command' },
      { source: '/search.php', destination: '/api/sitebar/search' },
      { source: '/sitebar.php', destination: '/' },
      { source: '/index.php', destination: '/' },
    ];
  },
};

module.exports = nextConfig;
