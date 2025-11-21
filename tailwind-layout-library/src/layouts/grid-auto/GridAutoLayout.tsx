import React from 'react';

export const metadata = {
  name: 'Auto-fit Grid',
  description: 'Responsive grid that auto-fills columns',
  category: 'Grid Layouts',
};

export default function GridAutoLayout() {
  const items = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="p-4">
      <p className="text-sm text-gray-500 mb-4">
        Resize the container to see items automatically reflow
      </p>

      {/* Auto-fit grid with minimum 150px columns */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
        {items.map((item) => (
          <div
            key={item}
            className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white p-6 rounded-lg text-center font-bold shadow-md"
          >
            Item {item}
          </div>
        ))}
      </div>
    </div>
  );
}
