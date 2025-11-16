'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { blockRegistry, BlockRenderer, type BlockType } from '../blocks';
import type { Block, PageWithBlocks } from '../../lib/db';

interface BlockWithData extends Omit<Block, 'data'> {
  data: any;
}

interface PageBuilderProps {
  slug?: string;
}

export const PageBuilder: React.FC<PageBuilderProps> = ({ slug: slugProp }) => {
  const params = useParams<{ slug?: string }>();
  const slug = slugProp || params.slug;
  const navigate = useNavigate();
  const [page, setPage] = useState<PageWithBlocks | null>(null);
  const [blocks, setBlocks] = useState<BlockWithData[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load page if editing
  useEffect(() => {
    if (slug) {
      loadPage(slug);
    }
  }, [slug]);

  const loadPage = async (pageSlug: string) => {
    try {
      const response = await fetch(`/api/pages/${pageSlug}`);
      const result = await response.json();
      if (result.success && result.data) {
        setPage(result.data);
        setPageTitle(result.data.title);
        setPageSlug(result.data.slug);
        setMetaDescription(result.data.meta_description || '');
        setBlocks(result.data.blocks);
      }
    } catch (err) {
      setError('Failed to load page');
      console.error(err);
    }
  };

  const addBlock = (type: BlockType) => {
    const config = blockRegistry[type];
    const newBlock: BlockWithData = {
      type,
      data: config.defaultData,
      position: blocks.length
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockIndex(blocks.length);
  };

  const updateBlock = (index: number, data: any) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], data };
    setBlocks(newBlocks);
  };

  const deleteBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks.map((block, i) => ({ ...block, position: i })));
    if (selectedBlockIndex === index) {
      setSelectedBlockIndex(null);
    }
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks.map((block, i) => ({ ...block, position: i })));
    setSelectedBlockIndex(newIndex);
  };

  const savePage = async () => {
    if (!pageTitle || !pageSlug) {
      setError('Title and slug are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create or update page
      let pageId = page?.id;

      if (!pageId) {
        const response = await fetch('/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: pageTitle,
            slug: pageSlug,
            meta_description: metaDescription
          })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        pageId = result.data.id;
      } else {
        const response = await fetch(`/api/pages/${pageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: pageTitle,
            slug: pageSlug,
            meta_description: metaDescription
          })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
      }

      // Update blocks
      const response = await fetch(`/api/pages/${pageId}/blocks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          blocks.map((block, i) => ({
            type: block.type,
            data: block.data,
            position: i
          }))
        )
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      alert('Page saved successfully!');
      if (!page) {
        navigate(`/admin/pages/${pageSlug}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const selectedBlock = selectedBlockIndex !== null ? blocks[selectedBlockIndex] : null;
  const selectedBlockConfig = selectedBlock
    ? blockRegistry[selectedBlock.type as BlockType]
    : null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {page ? 'Edit Page' : 'Create New Page'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Build your page using blocks
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={savePage}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Page'}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Page Settings */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Title
            </label>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter page title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug
            </label>
            <input
              type="text"
              value={pageSlug}
              onChange={(e) => setPageSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="page-slug"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <input
              type="text"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="SEO description"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-13rem)]">
        {/* Left Panel - Form */}
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Add Block</h2>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {Object.entries(blockRegistry).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => addBlock(key as BlockType)}
                  className="px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm font-medium"
                >
                  + {config.schema.title}
                </button>
              ))}
            </div>

            {selectedBlock && selectedBlockConfig && (
              <>
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                      Edit {selectedBlockConfig.schema.title}
                    </h2>
                    <button
                      onClick={() => setSelectedBlockIndex(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <Form
                    schema={selectedBlockConfig.schema}
                    formData={selectedBlock.data}
                    validator={validator}
                    onChange={(e) => updateBlock(selectedBlockIndex!, e.formData)}
                    onSubmit={(e) => {
                      updateBlock(selectedBlockIndex!, e.formData);
                      setSelectedBlockIndex(null);
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Apply Changes
                    </button>
                  </Form>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Preview</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {blocks.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p className="text-lg">No blocks yet</p>
                  <p className="text-sm mt-2">Add blocks from the left panel to start building</p>
                </div>
              ) : (
                blocks.map((block, index) => (
                  <div
                    key={index}
                    className={`relative group ${
                      selectedBlockIndex === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedBlockIndex(index)}
                  >
                    <BlockRenderer type={block.type as BlockType} data={block.data} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(index, 'up');
                        }}
                        disabled={index === 0}
                        className="px-2 py-1 bg-white border border-gray-300 rounded text-xs disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(index, 'down');
                        }}
                        disabled={index === blocks.length - 1}
                        className="px-2 py-1 bg-white border border-gray-300 rounded text-xs disabled:opacity-50"
                      >
                        ↓
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBlock(index);
                        }}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
