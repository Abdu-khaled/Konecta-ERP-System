/** Dev proxy that forwards /api to auth-service on 8081 and strips CORS-sensitive headers. */
const target = process.env.AUTH_API_TARGET || 'http://localhost:8081';

module.exports = {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    onProxyReq: (proxyReq) => {
      // Prevent Spring CORS from treating it as cross-origin during dev
      proxyReq.removeHeader('origin');
    },
    onProxyRes: (proxyRes) => {
      // Ensure browser accepts the response even if backend omits CORS headers
      proxyRes.headers['access-control-allow-origin'] = '*';
      proxyRes.headers['access-control-allow-credentials'] = 'true';
    },
  },
};
