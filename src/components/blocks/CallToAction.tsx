import React from 'react';

export interface CallToActionData {
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor?: string;
  textColor?: string;
}

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

export const CallToAction: React.FC<{ data: CallToActionData }> = ({ data }) => {
  return (
    <div
      className="py-16 px-4"
      style={{
        backgroundColor: data.backgroundColor || '#3b82f6',
        color: data.textColor || '#ffffff'
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">{data.heading}</h2>
        <p className="text-lg mb-8 opacity-90">{data.description}</p>
        <a
          href={data.buttonLink}
          className="inline-block bg-white text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition"
        >
          {data.buttonText}
        </a>
      </div>
    </div>
  );
};
