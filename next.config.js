module.exports = {
  async rewrites() {
    return [
      {
        source: '/list/:code(.*)',
        destination: '/list?c=:code',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path(.*)/',
        destination: '/:path',
        permanent: true,
      },
    ];
  },
  target: 'serverless',
};
