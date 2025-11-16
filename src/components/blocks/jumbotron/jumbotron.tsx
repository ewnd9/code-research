import React from 'react';

export interface JumbotronData {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

// Server Component - can be rendered on server or client
export function Jumbotron({ data }: { data: JumbotronData }) {
  return (
    <div
      className="relative bg-cover bg-center py-32 px-4"
      style={{
        backgroundImage: data.backgroundImage
          ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${data.backgroundImage})`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto text-center text-white">
        <h1 className="text-5xl font-bold mb-4">{data.title}</h1>
        <p className="text-xl mb-8">{data.subtitle}</p>
        {data.ctaText && data.ctaLink && (
          <a
            href={data.ctaLink}
            className="inline-block bg-white text-purple-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            {data.ctaText}
          </a>
        )}
      </div>
    </div>
  );
}
