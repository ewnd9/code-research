import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { renderToReadableStream } from 'react-dom/server';
import { PageViewServer } from '../pages/PageViewServer';
import {
  getPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  createBlock,
  deleteAllBlocksForPage,
  type Page,
  type InsertPage,
  type InsertBlock,
  type PageWithBlocks,
} from '../lib/db';
import {
  PageSchema,
  CreatePageSchema,
  UpdatePageSchema,
  UpdatePageBlocksSchema,
  PageWithBlocksSchema,
  ApiSuccessSchema,
  ApiErrorSchema,
} from './schemas';

// API Response type
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// API Handlers
const handleGetPages = (): ApiResponse<Page[]> => {
  try {
    const pages = getPages();
    return { success: true, data: pages };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const handleGetPage = (slug: string): ApiResponse<PageWithBlocks> => {
  try {
    const page = getPageBySlug(slug);
    if (!page) {
      return { success: false, error: 'Page not found' };
    }
    return { success: true, data: page };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const handleCreatePage = (page: InsertPage): ApiResponse<{ id: number }> => {
  try {
    const id = createPage(page);
    return { success: true, data: { id } };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const handleUpdatePage = (id: number, page: Partial<InsertPage>): ApiResponse => {
  try {
    updatePage(id, page);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const handleDeletePage = (id: number): ApiResponse => {
  try {
    deletePage(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const handleUpdatePageBlocks = (
  pageId: number,
  blocks: Omit<InsertBlock, 'id' | 'page_id' | 'created_at'>[]
): ApiResponse => {
  try {
    // Delete all existing blocks for the page
    deleteAllBlocksForPage(pageId);

    // Create new blocks
    blocks.forEach((block) => {
      createBlock({
        ...block,
        page_id: pageId,
      });
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

// Create Hono app with OpenAPI
const app = new OpenAPIHono();

// API Routes with OpenAPI documentation

// Get all pages
const getPagesRoute = createRoute({
  method: 'get',
  path: '/api/pages',
  tags: ['Pages'],
  summary: 'Get all pages',
  responses: {
    200: {
      description: 'List of all pages',
      content: {
        'application/json': {
          schema: ApiSuccessSchema.extend({
            data: z.array(PageSchema),
          }),
        },
      },
    },
  },
});

app.openapi(getPagesRoute, (c) => {
  const result = handleGetPages();
  return c.json(result);
});

// Get page by slug
const getPageRoute = createRoute({
  method: 'get',
  path: '/api/pages/{slug}',
  tags: ['Pages'],
  summary: 'Get a page by slug',
  request: {
    params: z.object({
      slug: z.string().openapi({
        param: {
          name: 'slug',
          in: 'path',
        },
        example: 'home',
      }),
    }),
  },
  responses: {
    200: {
      description: 'Page with blocks',
      content: {
        'application/json': {
          schema: ApiSuccessSchema.extend({
            data: PageWithBlocksSchema,
          }),
        },
      },
    },
    404: {
      description: 'Page not found',
      content: {
        'application/json': {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

app.openapi(getPageRoute, (c) => {
  const { slug } = c.req.valid('param');
  const result = handleGetPage(slug);
  return c.json(result, result.success ? 200 : 404);
});

// Create page
const createPageRoute = createRoute({
  method: 'post',
  path: '/api/pages',
  tags: ['Pages'],
  summary: 'Create a new page',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreatePageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Page created successfully',
      content: {
        'application/json': {
          schema: ApiSuccessSchema.extend({
            data: z.object({ id: z.number() }),
          }),
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

app.openapi(createPageRoute, async (c) => {
  const body = c.req.valid('json');
  const result = handleCreatePage(body);
  return c.json(result, result.success ? 200 : 400);
});

// Update page
const updatePageRoute = createRoute({
  method: 'put',
  path: '/api/pages/{id}',
  tags: ['Pages'],
  summary: 'Update a page',
  request: {
    params: z.object({
      id: z.string().transform(Number).openapi({
        param: {
          name: 'id',
          in: 'path',
        },
        example: '1',
      }),
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdatePageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Page updated successfully',
      content: {
        'application/json': {
          schema: ApiSuccessSchema,
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

app.openapi(updatePageRoute, async (c) => {
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');
  const result = handleUpdatePage(id, body);
  return c.json(result, result.success ? 200 : 400);
});

// Delete page
const deletePageRoute = createRoute({
  method: 'delete',
  path: '/api/pages/{id}',
  tags: ['Pages'],
  summary: 'Delete a page',
  request: {
    params: z.object({
      id: z.string().transform(Number).openapi({
        param: {
          name: 'id',
          in: 'path',
        },
        example: '1',
      }),
    }),
  },
  responses: {
    200: {
      description: 'Page deleted successfully',
      content: {
        'application/json': {
          schema: ApiSuccessSchema,
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

app.openapi(deletePageRoute, (c) => {
  const { id } = c.req.valid('param');
  const result = handleDeletePage(id);
  return c.json(result, result.success ? 200 : 400);
});

// Update page blocks
const updatePageBlocksRoute = createRoute({
  method: 'put',
  path: '/api/pages/{id}/blocks',
  tags: ['Blocks'],
  summary: 'Update all blocks for a page',
  request: {
    params: z.object({
      id: z.string().transform(Number).openapi({
        param: {
          name: 'id',
          in: 'path',
        },
        example: '1',
      }),
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdatePageBlocksSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Blocks updated successfully',
      content: {
        'application/json': {
          schema: ApiSuccessSchema,
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

app.openapi(updatePageBlocksRoute, async (c) => {
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');
  const result = handleUpdatePageBlocks(id, body);
  return c.json(result, result.success ? 200 : 400);
});

// OpenAPI documentation - manually create endpoint
app.get('/api/openapi.json', (c) => {
  return c.json(app.getOpenAPI31Document({
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'Block CMS API',
      description: 'REST API for Block CMS with React Server Components',
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
    ],
  }));
});

// Swagger UI
app.get('/api/docs', swaggerUI({ url: '/api/openapi.json' }));

// Static files for production (serve built Vite assets)
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // Serve static files from dist directory
  const serveStatic = async (c: any) => {
    const path = c.req.path;
    const filePath = `./dist${path === '/' ? '/index.html' : path}`;

    try {
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
    } catch (error) {
      // File doesn't exist, continue to next handler
    }
    return c.notFound();
  };

  // Serve admin static files
  app.get('/admin*', serveStatic);
  app.get('/assets/*', serveStatic);
  app.get('/src/*', serveStatic);
}

// SSR Routes for public pages
app.get('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');

    // Skip API routes
    if (slug === 'api') {
      return c.notFound();
    }

    // In development, redirect admin to Vite dev server
    if (slug === 'admin' && !isProduction) {
      return c.redirect('http://localhost:3000/admin');
    }

    const stream = await renderToReadableStream(<PageViewServer slug={slug} />, {
      bootstrapScripts: [],
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('SSR Error:', error);
    return c.text('Error rendering page', 500);
  }
});

// Root redirect
app.get('/', (c) => {
  if (isProduction) {
    // In production, serve the built admin app
    return c.redirect('/admin');
  } else {
    // In development, redirect to Vite dev server
    return c.redirect('http://localhost:3000/admin');
  }
});

// Start server
const server = Bun.serve({
  port: 3002,
  fetch: app.fetch,
});

console.log(`Unified Hono server (API + SSR) running at http://localhost:${server.port}`);
console.log(`- Public pages (SSR): http://localhost:${server.port}/:slug`);
console.log(`- API: http://localhost:${server.port}/api/*`);
console.log(`- API Docs (Swagger): http://localhost:${server.port}/api/docs`);
console.log(`- OpenAPI JSON: http://localhost:${server.port}/api/openapi.json`);
console.log(`- Admin: http://localhost:3000/admin (Vite dev server)`);
