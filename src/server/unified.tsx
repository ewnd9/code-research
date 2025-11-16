import {
  handleGetPages,
  handleGetPage,
  handleCreatePage,
  handleUpdatePage,
  handleDeletePage,
  handleUpdatePageBlocks
} from './api';
import { renderPageToStream } from './ssr';
import { readFileSync } from 'fs';
import { join } from 'path';

const server = Bun.serve({
  port: 3002,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // CORS headers
    const jsonHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: jsonHeaders });
    }

    // API Routes
    if (pathname.startsWith('/api')) {
      try {
        // Get all pages
        if (pathname === '/api/pages' && req.method === 'GET') {
          const result = handleGetPages();
          return new Response(JSON.stringify(result), { headers: jsonHeaders });
        }

        // Create a page
        if (pathname === '/api/pages' && req.method === 'POST') {
          const body = await req.json();
          const result = handleCreatePage(body);
          return new Response(JSON.stringify(result), { headers: jsonHeaders });
        }

        // Get a single page by slug
        if (pathname.startsWith('/api/pages/') && req.method === 'GET') {
          const slug = pathname.replace('/api/pages/', '');
          const result = handleGetPage(slug);
          return new Response(JSON.stringify(result), { headers: jsonHeaders });
        }

        // Update a page
        if (pathname.match(/^\/api\/pages\/\d+$/) && req.method === 'PUT') {
          const id = parseInt(pathname.split('/').pop()!);
          const body = await req.json();
          const result = handleUpdatePage(id, body);
          return new Response(JSON.stringify(result), { headers: jsonHeaders });
        }

        // Delete a page
        if (pathname.match(/^\/api\/pages\/\d+$/) && req.method === 'DELETE') {
          const id = parseInt(pathname.split('/').pop()!);
          const result = handleDeletePage(id);
          return new Response(JSON.stringify(result), { headers: jsonHeaders });
        }

        // Update page blocks
        if (pathname.match(/^\/api\/pages\/\d+\/blocks$/) && req.method === 'PUT') {
          const id = parseInt(pathname.split('/')[3]);
          const body = await req.json();
          const result = handleUpdatePageBlocks(id, body);
          return new Response(JSON.stringify(result), { headers: jsonHeaders });
        }

        return new Response(JSON.stringify({ success: false, error: 'Not found' }), {
          status: 404,
          headers: jsonHeaders
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, error: (error as Error).message }),
          { status: 500, headers: jsonHeaders }
        );
      }
    }

    // Admin routes - serve the Vite app
    if (pathname.startsWith('/admin')) {
      return new Response('Redirect to Vite dev server at http://localhost:3000', {
        status: 302,
        headers: { 'Location': `http://localhost:3000${pathname}` }
      });
    }

    // Public page routes - Server-side render with RSC
    if (pathname !== '/' && pathname.startsWith('/')) {
      try {
        const slug = pathname.slice(1); // Remove leading slash
        const stream = await renderPageToStream(slug);

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Transfer-Encoding': 'chunked',
          },
        });
      } catch (error) {
        console.error('SSR Error:', error);
        return new Response('Error rendering page', { status: 500 });
      }
    }

    // Root - redirect to admin
    if (pathname === '/') {
      return new Response(null, {
        status: 302,
        headers: { 'Location': 'http://localhost:3000/admin' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
});

console.log(`Unified server (API + SSR) running at http://localhost:${server.port}`);
console.log(`- Public pages (SSR): http://localhost:${server.port}/:slug`);
console.log(`- API: http://localhost:${server.port}/api/*`);
console.log(`- Admin: http://localhost:3000/admin (Vite dev server)`);
