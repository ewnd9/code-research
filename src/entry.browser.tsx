import React, { use, useState, useTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createFromFetch } from 'react-server-dom-webpack/client';

// Browser Entry Point
// This handles client-side hydration and navigation

// Create initial RSC response from SSR
const initialRSC = createFromFetch(
  fetch('/__rsc?url=' + encodeURIComponent(window.location.pathname))
);

function Root() {
  const [rsc, setRSC] = useState(initialRSC);
  const [isPending, startTransition] = useTransition();

  // Navigate function for client-side routing
  (window as any).navigate = (url: string) => {
    startTransition(() => {
      const newRSC = createFromFetch(
        fetch('/__rsc?url=' + encodeURIComponent(url))
      );
      setRSC(newRSC);
      window.history.pushState({}, '', url);
    });
  };

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    startTransition(() => {
      const newRSC = createFromFetch(
        fetch('/__rsc?url=' + encodeURIComponent(window.location.pathname))
      );
      setRSC(newRSC);
    });
  });

  return use(rsc);
}

// Hydrate the app
const root = document.getElementById('root');
if (root) {
  hydrateRoot(root, <Root />);
}
