import React from 'react';
import { PageView } from '../pages/PageView';
import { PagesList } from '../components/admin/PagesList';
import { PageBuilder } from '../components/admin/PageBuilder';

// Server Component Router
// This handles routing on the server side for RSC

interface RouterProps {
  url: string;
}

export function Router({ url }: RouterProps) {
  // Parse URL
  const pathname = url;

  // Admin routes
  if (pathname === '/admin') {
    return <PagesList />;
  }

  if (pathname === '/admin/pages/new') {
    return <PageBuilder />;
  }

  if (pathname.startsWith('/admin/pages/')) {
    const slug = pathname.replace('/admin/pages/', '');
    return <PageBuilder slug={slug} />;
  }

  // Root redirect to admin
  if (pathname === '/') {
    return <PagesList />;
  }

  // Public pages
  const slug = pathname.replace('/', '');
  return <PageView slug={slug} />;
}
