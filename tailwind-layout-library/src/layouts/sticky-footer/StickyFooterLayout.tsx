import React from 'react';

export const metadata = {
  name: 'Sticky Footer',
  description: 'Footer that stays at bottom even with little content',
  category: 'Page Layouts',
};

export default function StickyFooterLayout() {
  return (
    <div className="flex flex-col h-[400px] bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-lg font-bold text-gray-800">Site Header</h1>
      </header>

      {/* Main content - flex-1 pushes footer down */}
      <main className="flex-1 p-6">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sticky Footer Layout</h2>
          <p className="text-gray-600 mb-4">
            This layout ensures the footer always stays at the bottom of the viewport,
            even when there isn't enough content to fill the page.
          </p>
          <p className="text-gray-600">
            The key is using <code className="bg-gray-200 px-1 rounded">flex-1</code> on
            the main content area, which allows it to grow and push the footer down.
          </p>
        </div>
      </main>

      {/* Footer - stays at bottom */}
      <footer className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center">
          <p className="text-sm">© 2024 Company Name</p>
          <nav className="space-x-4 text-sm">
            <a href="#" className="hover:text-gray-300">Privacy</a>
            <a href="#" className="hover:text-gray-300">Terms</a>
            <a href="#" className="hover:text-gray-300">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
