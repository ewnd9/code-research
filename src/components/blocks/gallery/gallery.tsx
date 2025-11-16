import React from 'react';
import { GalleryImage as GalleryImageClient } from '../../client/GalleryImage';

export interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface GalleryData {
  heading: string;
  images: GalleryImage[];
  columns?: number;
}

// Server Component - can be rendered on server or client
export function Gallery({ data }: { data: GalleryData }) {
  const columns = data.columns || 3;
  const gridClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  }[columns];

  return (
    <div className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
          {data.heading}
        </h2>
        <div className={`grid grid-cols-1 ${gridClass} gap-6`}>
          {data.images.map((image, index) => (
            <GalleryImageClient
              key={index}
              url={image.url}
              alt={image.alt}
              caption={image.caption}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
