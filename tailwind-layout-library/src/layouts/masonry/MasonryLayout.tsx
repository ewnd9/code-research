import React from 'react';

export const metadata = {
  name: 'Masonry Grid',
  description: 'Pinterest-style masonry layout using CSS columns',
  category: 'Grid Layouts',
};

export default function MasonryLayout() {
  const items = [
    { height: 'h-32', color: 'bg-rose-400' },
    { height: 'h-48', color: 'bg-amber-400' },
    { height: 'h-24', color: 'bg-lime-400' },
    { height: 'h-40', color: 'bg-cyan-400' },
    { height: 'h-28', color: 'bg-violet-400' },
    { height: 'h-52', color: 'bg-pink-400' },
    { height: 'h-36', color: 'bg-teal-400' },
    { height: 'h-44', color: 'bg-orange-400' },
    { height: 'h-20', color: 'bg-indigo-400' },
    { height: 'h-56', color: 'bg-emerald-400' },
    { height: 'h-32', color: 'bg-fuchsia-400' },
    { height: 'h-40', color: 'bg-sky-400' },
  ];

  return (
    <div className="p-4">
      <p className="text-sm text-gray-500 mb-4">
        CSS columns-based masonry layout
      </p>

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={`${item.height} ${item.color} rounded-lg break-inside-avoid flex items-center justify-center text-white font-bold shadow-md`}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
