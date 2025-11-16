import React from 'react';
import type { BlockType } from '../index';
import { JumbotronServer } from './JumbotronServer';
import { CallToActionServer } from './CallToActionServer';
import { SeoListingServer } from './SeoListingServer';
import { GalleryServer } from './GalleryServer';

export async function BlockRendererServer({ type, data }: { type: BlockType; data: any }) {
  switch (type) {
    case 'jumbotron':
      return <JumbotronServer data={data} />;
    case 'cta':
      return <CallToActionServer data={data} />;
    case 'seo-listing':
      return <SeoListingServer data={data} />;
    case 'gallery':
      return <GalleryServer data={data} />;
    default:
      return <div>Unknown block type: {type}</div>;
  }
}
