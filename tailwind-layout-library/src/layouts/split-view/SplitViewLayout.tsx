import React from 'react';

export const metadata = {
  name: 'Split View',
  description: '50/50 split layout with responsive stacking',
  category: 'Page Layouts',
};

export default function SplitViewLayout() {
  return (
    <div className="space-y-6 p-4">
      {/* Horizontal Split */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Horizontal Split (50/50)</h3>
        <div className="flex flex-col md:flex-row h-64 gap-4">
          <div className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
            <div className="text-center p-4">
              <h4 className="text-xl font-bold mb-2">Left Panel</h4>
              <p className="text-blue-100 text-sm">Content or image area</p>
            </div>
          </div>
          <div className="flex-1 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
            <div className="text-center p-4">
              <h4 className="text-xl font-bold mb-2">Right Panel</h4>
              <p className="text-purple-100 text-sm">Content or form area</p>
            </div>
          </div>
        </div>
      </div>

      {/* Asymmetric Split */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Asymmetric Split (1/3 - 2/3)</h3>
        <div className="flex flex-col md:flex-row h-48 gap-4">
          <div className="md:w-1/3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white p-4">
            <span className="font-semibold">Narrow</span>
          </div>
          <div className="md:w-2/3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center text-white p-4">
            <span className="font-semibold">Wide Content Area</span>
          </div>
        </div>
      </div>
    </div>
  );
}
