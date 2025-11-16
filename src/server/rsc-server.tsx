import { Hono } from 'hono';
import { serve } from 'bun';

// Import the existing API app
import { app as apiApp } from './hono-server';

// Import RSC and SSR entry points (these will be loaded via Vite in dev)
// In production, these would be pre-built

const app = new Hono();

// Mount API routes
app.route('/api', apiApp);

// RSC endpoint - returns React Server Component stream
app.get('/__rsc', async (c) => {
  const url = c.req.query('url') || '/';

  try {
    // In development, use Vite to load and execute RSC entry
    // This is a simplified version - @vitejs/plugin-rsc handles this automatically
    const { render } = await import('../entry.rsc');
    const stream = await render(url);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/x-component',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('RSC Error:', error);
    return c.json({ error: 'RSC rendering failed' }, 500);
  }
});

// SSR endpoint - returns full HTML with embedded RSC
app.get('*', async (c) => {
  const url = c.req.url;

  try {
    // First, get the RSC stream
    const { render: renderRSC } = await import('../entry.rsc');
    const rscStream = await renderRSC(url);

    // Then, render SSR with the RSC stream
    const { render: renderSSR } = await import('../entry.ssr');
    const htmlStream = await renderSSR(url, rscStream);

    return new Response(htmlStream, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('SSR Error:', error);
    return c.html(
      `<html>
        <body>
          <h1>Error</h1>
          <p>Failed to render page</p>
          <pre>${error}</pre>
        </body>
      </html>`,
      500
    );
  }
});

// Start server
const server = serve({
  port: 3002,
  fetch: app.fetch,
});

console.log(`RSC server running at http://localhost:${server.port}`);
console.log(`- API: http://localhost:${server.port}/api/*`);
console.log(`- RSC: http://localhost:${server.port}/__rsc`);
console.log(`- Pages: http://localhost:${server.port}/*`);
