import React from 'react';

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

export const gallerySchema = {
  title: 'Gallery',
  type: 'object',
  required: ['heading', 'images'],
  properties: {
    heading: {
      type: 'string',
      title: 'Gallery Heading',
      default: 'Photo Gallery'
    },
    columns: {
      type: 'number',
      title: 'Number of Columns',
      enum: [2, 3, 4],
      default: 3
    },
    images: {
      type: 'array',
      title: 'Images',
      items: {
        type: 'object',
        required: ['url', 'alt'],
        properties: {
          url: {
            type: 'string',
            title: 'Image URL'
          },
          alt: {
            type: 'string',
            title: 'Alt Text'
          },
          caption: {
            type: 'string',
            title: 'Caption'
          }
        }
      },
      default: [
        {
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
          alt: 'Mountain landscape',
          caption: 'Beautiful mountain view'
        },
        {
          url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600',
          alt: 'Nature scene',
          caption: 'Peaceful nature'
        },
        {
          url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600',
          alt: 'Sunset landscape',
          caption: 'Golden hour'
        },
        {
          url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600',
          alt: 'Forest path',
          caption: 'Into the woods'
        },
        {
          url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600',
          alt: 'Lake view',
          caption: 'Serene lake'
        },
        {
          url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=600',
          alt: 'Ocean waves',
          caption: 'Ocean breeze'
        }
      ]
    }
  }
};

export const Gallery: React.FC<{ data: GalleryData }> = ({ data }) => {
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
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition"
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 transform translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-sm">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
