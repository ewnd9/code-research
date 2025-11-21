import { $ } from 'bun';

const clientScript = await Bun.build({
  entrypoints: ['./src/client.tsx'],
  minify: false,
  target: 'browser',
});

const clientJs = await clientScript.outputs[0].text();

// Process Tailwind CSS to a temp file
const projectDir = import.meta.dir + '/..';
await $`bunx tailwindcss -i ./src/styles.css -o ./dist/styles.css`.cwd(projectDir);
const cssOutput = await Bun.file(`${projectDir}/dist/styles.css`).text();

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind Layout Library</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <div id="root"></div>
  <script src="/client.js" defer></script>
</body>
</html>`;

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/client.js') {
      return new Response(clientJs, {
        headers: { 'Content-Type': 'application/javascript' },
      });
    }

    if (url.pathname === '/styles.css') {
      return new Response(cssOutput, {
        headers: { 'Content-Type': 'text/css' },
      });
    }

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
