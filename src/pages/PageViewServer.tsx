import React from 'react';
import { getPageBySlug } from '../lib/db';
import { BlockRenderer, type BlockType } from '../components/blocks';

// Async Server Component - renders pages server-side
export async function PageViewServer({ slug }: { slug: string }) {
  // Fetch data directly from the database (server-side only)
  const page = getPageBySlug(slug);

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600">Page not found</p>
        </div>
      </div>
    );
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{page.title}</title>
        {page.meta_description && (
          <meta name="description" content={page.meta_description} />
        )}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div className="min-h-screen">
          {/* Using the universal BlockRenderer - works in server context */}
          {page.blocks.map((block, index) => (
            <BlockRenderer
              key={index}
              type={block.type as BlockType}
              data={block.data}
            />
          ))}
        </div>
      </body>
    </html>
  );
}
