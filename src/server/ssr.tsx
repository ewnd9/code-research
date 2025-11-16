import React from 'react';
import { renderToReadableStream } from 'react-dom/server';
import { PageViewServer } from '../pages/PageViewServer';

export async function renderPageToStream(slug: string): Promise<ReadableStream> {
  const stream = await renderToReadableStream(<PageViewServer slug={slug} />, {
    bootstrapScripts: [],
  });

  return stream;
}
