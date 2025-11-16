import React from 'react';
import { Jumbotron, type JumbotronData } from './jumbotron/jumbotron';
import { jumbotronSchema, jumbotronDefaultData } from './jumbotron/jumbotron-schema';
import { CallToAction, type CallToActionData } from './call-to-action/call-to-action';
import { callToActionSchema, callToActionDefaultData } from './call-to-action/call-to-action-schema';
import { SeoListing, type SeoListingData } from './seo-listing/seo-listing';
import { seoListingSchema, seoListingDefaultData } from './seo-listing/seo-listing-schema';
import { Gallery, type GalleryData } from './gallery/gallery';
import { gallerySchema, galleryDefaultData } from './gallery/gallery-schema';

export type BlockType = 'jumbotron' | 'cta' | 'seo-listing' | 'gallery';

export type BlockData = JumbotronData | CallToActionData | SeoListingData | GalleryData;

export interface BlockConfig {
  type: BlockType;
  component: React.FC<{ data: any }>;
  schema: any;
  defaultData: any;
}

export const blockRegistry: Record<BlockType, BlockConfig> = {
  jumbotron: {
    type: 'jumbotron',
    component: Jumbotron,
    schema: jumbotronSchema,
    defaultData: jumbotronDefaultData
  },
  cta: {
    type: 'cta',
    component: CallToAction,
    schema: callToActionSchema,
    defaultData: callToActionDefaultData
  },
  'seo-listing': {
    type: 'seo-listing',
    component: SeoListing,
    schema: seoListingSchema,
    defaultData: seoListingDefaultData
  },
  gallery: {
    type: 'gallery',
    component: Gallery,
    schema: gallerySchema,
    defaultData: galleryDefaultData
  }
};

// Universal BlockRenderer - works in both server and client contexts
export function BlockRenderer({ type, data }: { type: BlockType; data: any }) {
  const config = blockRegistry[type];
  if (!config) {
    return <div>Unknown block type: {type}</div>;
  }
  const Component = config.component;
  return <Component data={data} />;
}

// Re-export types for convenience
export type { JumbotronData, CallToActionData, SeoListingData, GalleryData };
