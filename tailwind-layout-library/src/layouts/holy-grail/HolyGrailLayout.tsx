import React from 'react';

export const metadata = {
  name: 'Holy Grail Layout',
  description: 'Classic 3-column layout with header and footer',
  category: 'Page Layouts',
};

export default function HolyGrailLayout() {
  return (
    <div className="flex flex-col h-[500px]">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4">
        <h1 className="text-xl font-bold">Header</h1>
      </header>

      {/* Main section with 3 columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-48 bg-indigo-100 p-4">
          <h2 className="font-semibold mb-2">Left Sidebar</h2>
          <ul className="space-y-1 text-sm">
            <li>Navigation 1</li>
            <li>Navigation 2</li>
            <li>Navigation 3</li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white p-4 overflow-auto">
          <h2 className="font-semibold mb-2">Main Content</h2>
          <p className="text-gray-600 text-sm">
            The Holy Grail layout is a classic web design pattern featuring a header,
            footer, and three columns. The center column contains the main content,
            while the two side columns contain navigation or supplementary information.
          </p>
        </main>

        {/* Right Sidebar */}
        <aside className="w-48 bg-indigo-100 p-4">
          <h2 className="font-semibold mb-2">Right Sidebar</h2>
          <div className="text-sm text-gray-600">
            <p>Ads or related content</p>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="bg-indigo-600 text-white p-4">
        <p className="text-center">Footer</p>
      </footer>
    </div>
  );
}
