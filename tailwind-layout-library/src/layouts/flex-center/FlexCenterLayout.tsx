import React from 'react';

export const metadata = {
  name: 'Flex Center',
  description: 'Various ways to center content with flexbox',
  category: 'Flexbox',
};

export default function FlexCenterLayout() {
  return (
    <div className="space-y-6 p-4">
      {/* Horizontal and Vertical Center */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Perfect Center</h3>
        <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
          <div className="bg-purple-500 text-white px-6 py-3 rounded-lg shadow-lg">
            Centered Content
          </div>
        </div>
      </div>

      {/* Space Between */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Space Between</h3>
        <div className="h-16 bg-gray-100 rounded flex items-center justify-between px-4">
          <div className="bg-green-500 text-white px-4 py-2 rounded">Left</div>
          <div className="bg-green-500 text-white px-4 py-2 rounded">Center</div>
          <div className="bg-green-500 text-white px-4 py-2 rounded">Right</div>
        </div>
      </div>

      {/* Space Around */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Space Around</h3>
        <div className="h-16 bg-gray-100 rounded flex items-center justify-around">
          <div className="bg-orange-500 text-white px-4 py-2 rounded">A</div>
          <div className="bg-orange-500 text-white px-4 py-2 rounded">B</div>
          <div className="bg-orange-500 text-white px-4 py-2 rounded">C</div>
        </div>
      </div>

      {/* Space Evenly */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Space Evenly</h3>
        <div className="h-16 bg-gray-100 rounded flex items-center justify-evenly">
          <div className="bg-pink-500 text-white px-4 py-2 rounded">1</div>
          <div className="bg-pink-500 text-white px-4 py-2 rounded">2</div>
          <div className="bg-pink-500 text-white px-4 py-2 rounded">3</div>
        </div>
      </div>
    </div>
  );
}
