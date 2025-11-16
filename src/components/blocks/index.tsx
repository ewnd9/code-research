import React from 'react';
import { Jumbotron, JumbotronData, jumbotronSchema } from './Jumbotron';
import { CallToAction, CallToActionData, callToActionSchema } from './CallToAction';
import { SeoListing, SeoListingData, seoListingSchema } from './SeoListing';
import { Gallery, GalleryData, gallerySchema } from './Gallery';

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
    defaultData: {
      title: 'Welcome to Our Site',
      subtitle: 'Discover amazing content',
      backgroundImage: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200',
      ctaText: 'Get Started',
      ctaLink: '#'
    }
  },
  cta: {
    type: 'cta',
    component: CallToAction,
    schema: callToActionSchema,
    defaultData: {
      heading: 'Ready to Get Started?',
      description: 'Join thousands of satisfied customers today',
      buttonText: 'Get Started',
      buttonLink: '#',
      backgroundColor: '#3b82f6',
      textColor: '#ffffff'
    }
  },
  'seo-listing': {
    type: 'seo-listing',
    component: SeoListing,
    schema: seoListingSchema,
    defaultData: {
      heading: 'Our Services',
      items: [
        {
          title: 'Service 1',
          description: 'High-quality service with attention to detail',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
          link: '#'
        },
        {
          title: 'Service 2',
          description: 'Expert solutions for your business needs',
          image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
          link: '#'
        },
        {
          title: 'Service 3',
          description: 'Innovative approaches to complex problems',
          image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400',
          link: '#'
        }
      ]
    }
  },
  gallery: {
    type: 'gallery',
    component: Gallery,
    schema: gallerySchema,
    defaultData: {
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
    }
  }
};

export const BlockRenderer: React.FC<{ type: BlockType; data: any }> = ({ type, data }) => {
  const config = blockRegistry[type];
  if (!config) {
    return <div>Unknown block type: {type}</div>;
  }
  const Component = config.component;
  return <Component data={data} />;
};
