import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Runs the Vercel serverless functions in `api/` during `npm run dev`, so the
 * dev server behaves like production without needing the Vercel CLI. The
 * handler is imported fresh on each request, so edits to it apply immediately.
 */
function apiRoutes() {
  return {
    name: 'kaiu-api-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        const route = req.url.split('?')[0].replace(/^\/api\//, '').replace(/\/$/, '');
        if (!/^[a-z0-9-]+$/.test(route)) return next();

        let handler;
        try {
          const mod = await server.ssrLoadModule(`/api/${route}.js`);
          handler = mod.default;
        } catch {
          return next();
        }
        if (typeof handler !== 'function') return next();

        // Minimal shim of the Vercel request/response helpers.
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (payload) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(payload));
          return res;
        };

        try {
          await handler(req, res);
        } catch (err) {
          server.config.logger.error(`[api/${route}] ${err?.stack || err}`);
          if (!res.headersSent) res.statusCode = 500;
          res.end(JSON.stringify({ ok: false, error: 'server_error' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load unprefixed vars (CONTACT_SHEET_ENDPOINT etc.) into process.env so the
  // dev-mode API handlers can read them the way they do on Vercel. Only the
  // server side sees these; nothing here is exposed to the client bundle.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [react(), apiRoutes()],
    server: {
      // Honour PORT when the environment assigns one.
      port: Number(process.env.PORT) || 5173,
    },
  };
});
