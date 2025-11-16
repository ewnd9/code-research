export const callToActionSchema = {
  title: 'Call to Action',
  type: 'object',
  required: ['heading', 'description', 'buttonText', 'buttonLink'],
  properties: {
    heading: {
      type: 'string',
      title: 'Heading',
      default: 'Ready to Get Started?'
    },
    description: {
      type: 'string',
      title: 'Description',
      default: 'Join thousands of satisfied customers today'
    },
    buttonText: {
      type: 'string',
      title: 'Button Text',
      default: 'Get Started'
    },
    buttonLink: {
      type: 'string',
      title: 'Button Link',
      default: '#'
    },
    backgroundColor: {
      type: 'string',
      title: 'Background Color',
      default: '#3b82f6'
    },
    textColor: {
      type: 'string',
      title: 'Text Color',
      default: '#ffffff'
    }
  }
};

export const callToActionDefaultData = {
  heading: 'Ready to Get Started?',
  description: 'Join thousands of satisfied customers today',
  buttonText: 'Get Started',
  buttonLink: '#',
  backgroundColor: '#3b82f6',
  textColor: '#ffffff'
};
