'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BlockRenderer } from '../components/blocks';
import type { PageWithBlocks } from '../lib/db';

interface PageViewProps {
  slug?: string;
}

export const PageView: React.FC<PageViewProps> = ({ slug: slugProp }) => {
  const params = useParams<{ slug?: string }>();
  const slug = slugProp || params.slug || '';
  const [page, setPage] = useState<PageWithBlocks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      loadPage(slug);
    }
  }, [slug]);

  const loadPage = async (pageSlug: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pages/${pageSlug}`);
      const result = await response.json();

      if (result.success && result.data) {
        setPage(result.data);
        // Set page title
        document.title = result.data.title;
        // Set meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && result.data.meta_description) {
          metaDescription.setAttribute('content', result.data.meta_description);
        }
      } else {
        setError(result.error || 'Page not found');
      }
    } catch (err) {
      setError('Failed to load page');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-4">{error || 'Page not found'}</p>
          <a href="/" className="text-blue-600 hover:text-blue-700">
            Go home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {page.blocks.map((block, index) => (
        <BlockRenderer key={index} type={block.type as any} data={block.data} />
      ))}
    </div>
  );
};
