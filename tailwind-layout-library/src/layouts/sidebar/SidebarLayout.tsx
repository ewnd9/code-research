import React from 'react';

export const metadata = {
  name: 'Sidebar Layout',
  description: 'Classic sidebar with main content area',
  category: 'Page Layouts',
};

export default function SidebarLayout() {
  return (
    <div className="flex h-[400px]">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white p-4">
        <h2 className="text-lg font-bold mb-4">Sidebar</h2>
        <nav className="space-y-2">
          <a href="#" className="block px-3 py-2 rounded hover:bg-slate-700">Dashboard</a>
          <a href="#" className="block px-3 py-2 rounded hover:bg-slate-700">Projects</a>
          <a href="#" className="block px-3 py-2 rounded hover:bg-slate-700">Settings</a>
          <a href="#" className="block px-3 py-2 rounded hover:bg-slate-700">Profile</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-4">Main Content</h1>
        <p className="text-gray-600">
          This is the main content area. The sidebar stays fixed on the left while
          the content fills the remaining space.
        </p>
      </main>
    </div>
  );
}
