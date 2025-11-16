import React from 'react';
import { renderToReadableStream } from 'react-server-dom-webpack/server';
import { Router } from './framework/Router';

// RSC Entry Point
// This runs on the server and renders React Server Components

export async function render(url: string) {
  // Parse the URL to get the route
  const urlObj = new URL(url, 'http://localhost');
  const pathname = urlObj.pathname;

  // Render the root component (Router handles routing)
  const root = <Router url={pathname} />;

  // Return RSC stream
  return renderToReadableStream(root, {
    bundlerConfig: {}, // Will be populated by Vite plugin
  });
}
