export const seoListingSchema = {
  title: 'SEO Listing',
  type: 'object',
  required: ['heading', 'items'],
  properties: {
    heading: {
      type: 'string',
      title: 'Section Heading',
      default: 'Our Services'
    },
    items: {
      type: 'array',
      title: 'Items',
      items: {
        type: 'object',
        required: ['title', 'description'],
        properties: {
          title: {
            type: 'string',
            title: 'Title'
          },
          description: {
            type: 'string',
            title: 'Description'
          },
          image: {
            type: 'string',
            title: 'Image URL'
          },
          link: {
            type: 'string',
            title: 'Link URL'
          }
        }
      },
      default: [
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
  }
};

export const seoListingDefaultData = {
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
};
