import { createPage, createBlock } from './src/lib/db';

console.log('Seeding database...');

try {
  // Create a sample home page
  const pageId = createPage({
    slug: 'home',
    title: 'Welcome to Block CMS',
    meta_description: 'A modern block-based content management system built with React and Bun'
  });

  console.log(`Created page with ID: ${pageId}`);

  // Add a jumbotron block
  createBlock({
    page_id: pageId,
    type: 'jumbotron',
    data: {
      title: 'Build Beautiful Pages with Blocks',
      subtitle: 'A modern CMS that lets you create stunning pages using pre-built blocks',
      backgroundImage: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200',
      ctaText: 'Get Started',
      ctaLink: '/admin'
    },
    position: 0
  });

  // Add a SEO listing block
  createBlock({
    page_id: pageId,
    type: 'seo-listing',
    data: {
      heading: 'Features',
      items: [
        {
          title: 'Visual Page Builder',
          description: 'Build pages visually with a live preview. See your changes in real-time.',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
          link: '#'
        },
        {
          title: 'Pre-built Blocks',
          description: 'Choose from a variety of professionally designed blocks to build your pages.',
          image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
          link: '#'
        },
        {
          title: 'SEO Optimized',
          description: 'Built-in SEO features to help your pages rank better in search engines.',
          image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400',
          link: '#'
        }
      ]
    },
    position: 1
  });

  // Add a gallery block
  createBlock({
    page_id: pageId,
    type: 'gallery',
    data: {
      heading: 'Beautiful Gallery',
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
    },
    position: 2
  });

  // Add a CTA block
  createBlock({
    page_id: pageId,
    type: 'cta',
    data: {
      heading: 'Ready to Build Your Website?',
      description: 'Start creating beautiful pages today with our intuitive page builder',
      buttonText: 'Go to Admin',
      buttonLink: '/admin',
      backgroundColor: '#3b82f6',
      textColor: '#ffffff'
    },
    position: 3
  });

  console.log('Database seeded successfully!');
  console.log('\nYou can now view the sample page at: http://localhost:3000/home');
  console.log('Or visit the admin at: http://localhost:3000/admin');
} catch (error) {
  console.error('Error seeding database:', error);
  process.exit(1);
}
