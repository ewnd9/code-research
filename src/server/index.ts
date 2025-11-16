import {
  handleGetPages,
  handleGetPage,
  handleCreatePage,
  handleUpdatePage,
  handleDeletePage,
  handleUpdatePageBlocks
} from './api';

const server = Bun.serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // API Routes
    if (pathname.startsWith('/api')) {
      try {
        // Get all pages
        if (pathname === '/api/pages' && req.method === 'GET') {
          const result = handleGetPages();
          return new Response(JSON.stringify(result), { headers });
        }

        // Create a page
        if (pathname === '/api/pages' && req.method === 'POST') {
          const body = await req.json();
          const result = handleCreatePage(body);
          return new Response(JSON.stringify(result), { headers });
        }

        // Get a single page by slug
        if (pathname.startsWith('/api/pages/') && req.method === 'GET') {
          const slug = pathname.replace('/api/pages/', '');
          const result = handleGetPage(slug);
          return new Response(JSON.stringify(result), { headers });
        }

        // Update a page
        if (pathname.match(/^\/api\/pages\/\d+$/) && req.method === 'PUT') {
          const id = parseInt(pathname.split('/').pop()!);
          const body = await req.json();
          const result = handleUpdatePage(id, body);
          return new Response(JSON.stringify(result), { headers });
        }

        // Delete a page
        if (pathname.match(/^\/api\/pages\/\d+$/) && req.method === 'DELETE') {
          const id = parseInt(pathname.split('/').pop()!);
          const result = handleDeletePage(id);
          return new Response(JSON.stringify(result), { headers });
        }

        // Update page blocks
        if (pathname.match(/^\/api\/pages\/\d+\/blocks$/) && req.method === 'PUT') {
          const id = parseInt(pathname.split('/')[3]);
          const body = await req.json();
          const result = handleUpdatePageBlocks(id, body);
          return new Response(JSON.stringify(result), { headers });
        }

        return new Response(JSON.stringify({ success: false, error: 'Not found' }), {
          status: 404,
          headers
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, error: (error as Error).message }),
          { status: 500, headers }
        );
      }
    }

    return new Response('Not Found', { status: 404 });
  }
});

console.log(`API server running at http://localhost:${server.port}`);
