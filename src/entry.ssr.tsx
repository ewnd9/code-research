import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { createFromReadableStream } from 'react-server-dom-webpack/client';

// SSR Entry Point
// This renders the HTML shell and injects the RSC stream

export async function render(url: string, rscStream: ReadableStream) {
  // Create React element from RSC stream
  const root = await createFromReadableStream(rscStream, {
    serverConsumerManifest: {
      moduleMap: {},
      moduleLoading: null,
    },
  });

  return new Promise<ReadableStream>((resolve, reject) => {
    const { pipe } = renderToPipeableStream(
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Block CMS</title>
          <meta name="description" content="A modern block-based content management system" />
        </head>
        <body>
          <div id="root">{root}</div>
          <script type="module" src="/src/entry.browser.tsx"></script>
        </body>
      </html>,
      {
        onShellReady() {
          const stream = new ReadableStream({
            start(controller) {
              pipe({
                write(chunk: string) {
                  controller.enqueue(new TextEncoder().encode(chunk));
                },
                end() {
                  controller.close();
                },
                destroy(error?: Error) {
                  if (error) {
                    controller.error(error);
                  } else {
                    controller.close();
                  }
                },
              } as any);
            },
          });
          resolve(stream);
        },
        onShellError(error) {
          reject(error);
        },
      }
    );
  });
}
