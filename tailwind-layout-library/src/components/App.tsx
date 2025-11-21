import React, { useState, useMemo } from 'react';
import { layouts, categories, type LayoutModule } from '../layouts';

export default function App() {
  const [selectedId, setSelectedId] = useState<string>(layouts[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedLayout = layouts.find(l => l.id === selectedId);

  const filteredLayouts = useMemo(() => {
    if (!searchQuery) return layouts;
    const query = searchQuery.toLowerCase();
    return layouts.filter(
      l =>
        l.metadata.name.toLowerCase().includes(query) ||
        l.metadata.description.toLowerCase().includes(query) ||
        l.metadata.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const layoutsByCategory = useMemo(() => {
    const grouped: Record<string, LayoutModule[]> = {};
    for (const layout of filteredLayouts) {
      const cat = layout.metadata.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(layout);
    }
    return grouped;
  }, [filteredLayouts]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Tailwind Layouts</h1>
          <p className="text-sm text-gray-500 mt-1">CSS Layout Patterns</p>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search layouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Layout List */}
        <nav className="flex-1 overflow-y-auto p-3">
          {Object.entries(layoutsByCategory).map(([category, categoryLayouts]) => (
            <div key={category} className="mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                {category}
              </h2>
              <ul className="space-y-1">
                {categoryLayouts.map((layout) => (
                  <li key={layout.id}>
                    <button
                      onClick={() => setSelectedId(layout.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedId === layout.id
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {layout.metadata.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {filteredLayouts.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No layouts found
            </p>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 text-xs text-gray-400">
          {layouts.length} layouts available
        </div>
      </aside>

      {/* Right Preview Panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Preview Header */}
        {selectedLayout && (
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {selectedLayout.metadata.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedLayout.metadata.description}
                </p>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {selectedLayout.metadata.category}
              </span>
            </div>
          </div>
        )}

        {/* Preview Area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {selectedLayout ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <selectedLayout.component />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a layout to preview
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
