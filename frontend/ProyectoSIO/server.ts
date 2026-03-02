import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');

  // Archivos estáticos con caché
  server.use(express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
  }));

  // Todas las rutas devuelven index.html (SPA)
  server.get('/*', (req, res) => {
    res.sendFile(join(browserDistFolder, 'index.html'));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();

  server.listen(port, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${port}`);
  });
}

run();
