import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import healthHandler from './api/health.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Health endpoint for NEA APIs monitoring
  app.get(['/api/health', '/api/health.js'], healthHandler);

  // Optional server-side proxy cache for NEA APIs to bypass any browser CORS or rate restrictions
  app.get('/api/nea/psi', async (_req, res) => {
    try {
      const response = await fetch('https://api-open.data.gov.sg/v2/real-time/api/psi');
      const data = await response.json();
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.json(data);
    } catch (err: any) {
      res.status(502).json({ error: err.message || 'Failed to fetch PSI data' });
    }
  });

  app.get('/api/nea/pm25', async (_req, res) => {
    try {
      const response = await fetch('https://api-open.data.gov.sg/v2/real-time/api/pm25');
      const data = await response.json();
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.json(data);
    } catch (err: any) {
      res.status(502).json({ error: err.message || 'Failed to fetch PM2.5 data' });
    }
  });

  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
