'use client';

import React, { useState } from 'react';

interface GalleryImageProps {
  url: string;
  alt: string;
  caption?: string;
}

export function GalleryImage({ url, alt, caption }: GalleryImageProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={url}
        alt={alt}
        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
      />
      {caption && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 transition-transform ${
            isHovered ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <p className="text-sm">{caption}</p>
        </div>
      )}
    </div>
  );
}
