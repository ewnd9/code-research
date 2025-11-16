export const jumbotronSchema = {
  title: 'Jumbotron',
  type: 'object',
  required: ['title', 'subtitle'],
  properties: {
    title: {
      type: 'string',
      title: 'Title',
      default: 'Welcome to Our Site'
    },
    subtitle: {
      type: 'string',
      title: 'Subtitle',
      default: 'Discover amazing content'
    },
    backgroundImage: {
      type: 'string',
      title: 'Background Image URL',
      default: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200'
    },
    ctaText: {
      type: 'string',
      title: 'CTA Button Text'
    },
    ctaLink: {
      type: 'string',
      title: 'CTA Button Link'
    }
  }
};

export const jumbotronDefaultData = {
  title: 'Welcome to Our Site',
  subtitle: 'Discover amazing content',
  backgroundImage: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200',
  ctaText: 'Get Started',
  ctaLink: '#'
};
