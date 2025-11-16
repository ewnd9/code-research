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

export const galleryDefaultData = {
  heading: 'Photo Gallery',
  columns: 3,
  images: [
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
    }
  ]
};
