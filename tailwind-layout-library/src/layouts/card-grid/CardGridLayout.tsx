import React from 'react';

export const metadata = {
  name: 'Card Grid',
  description: 'Responsive card grid with consistent heights',
  category: 'Grid Layouts',
};

export default function CardGridLayout() {
  const cards = [
    { title: 'Analytics', desc: 'Track your performance metrics in real-time', icon: '📊' },
    { title: 'Security', desc: 'Enterprise-grade security for your data', icon: '🔒' },
    { title: 'Speed', desc: 'Lightning fast performance', icon: '⚡' },
    { title: 'Support', desc: '24/7 customer support available worldwide', icon: '💬' },
    { title: 'Integration', desc: 'Connect with your favorite tools', icon: '🔗' },
    { title: 'Customization', desc: 'Fully customizable to your needs', icon: '🎨' },
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100"
          >
            <div className="text-4xl mb-4">{card.icon}</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{card.title}</h3>
            <p className="text-gray-600 text-sm">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
