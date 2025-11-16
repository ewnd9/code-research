import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BlockRenderer, type BlockType } from '../components/blocks';
import type { PageWithBlocks } from '../lib/db';

export const PageView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
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
      const response = await fetch(`http://localhost:3001/api/pages/${pageSlug}`);
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
        setError('Page not found');
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
          <p className="text-gray-600">{error || 'Page not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {page.blocks.map((block, index) => (
        <BlockRenderer key={index} type={block.type as BlockType} data={block.data} />
      ))}
    </div>
  );
};
