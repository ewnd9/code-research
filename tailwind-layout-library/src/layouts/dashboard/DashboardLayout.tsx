import React from 'react';

export const metadata = {
  name: 'Dashboard Layout',
  description: 'Admin dashboard with sidebar, header, and content grid',
  category: 'Page Layouts',
};

export default function DashboardLayout() {
  return (
    <div className="flex h-[500px] bg-gray-900">
      {/* Sidebar */}
      <aside className="w-16 bg-gray-800 flex flex-col items-center py-4 space-y-4">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
          D
        </div>
        <nav className="flex-1 flex flex-col space-y-2">
          {['🏠', '📊', '👥', '⚙️', '📁'].map((icon, i) => (
            <button
              key={i}
              className="w-10 h-10 rounded-lg hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              {icon}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
          <h1 className="text-white font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">Welcome, User</span>
            <div className="w-8 h-8 bg-indigo-500 rounded-full"></div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Revenue', value: '$45,231', color: 'bg-green-500' },
              { label: 'Users', value: '2,345', color: 'bg-blue-500' },
              { label: 'Orders', value: '1,234', color: 'bg-purple-500' },
              { label: 'Growth', value: '+12.5%', color: 'bg-orange-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4">
                <div className={`w-2 h-2 ${stat.color} rounded-full mb-2`}></div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-white text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4 h-48">
              <h3 className="text-white font-semibold mb-2">Chart Area</h3>
              <div className="h-32 bg-gray-700 rounded flex items-center justify-center text-gray-500">
                Chart Placeholder
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 h-48">
              <h3 className="text-white font-semibold mb-2">Activity</h3>
              <div className="space-y-2">
                {['New user signup', 'Order completed', 'Payment received'].map((item, i) => (
                  <div key={i} className="text-sm text-gray-400 py-1 border-b border-gray-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
