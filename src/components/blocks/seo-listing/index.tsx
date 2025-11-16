import React from 'react';

export interface SeoListingItem {
  title: string;
  description: string;
  image?: string;
  link?: string;
}

export interface SeoListingData {
  heading: string;
  items: SeoListingItem[];
}

// Server Component - can be rendered on server or client
export function SeoListing({ data }: { data: SeoListingData }) {
  return (
    <div className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
          {data.heading}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.items.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                {item.link && (
                  <a
                    href={item.link}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Learn more →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
