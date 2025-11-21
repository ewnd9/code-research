import React, { useState } from 'react';

export const metadata = {
  name: 'Responsive Navigation',
  description: 'Navigation that collapses to hamburger menu on mobile',
  category: 'Navigation',
};

export default function ResponsiveNavLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-100 h-[400px]">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-indigo-600">Logo</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Home</a>
              <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Products</a>
              <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">About</a>
              <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Contact</a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-indigo-600 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden pb-4">
              <a href="#" className="block py-2 text-gray-700 hover:text-indigo-600">Home</a>
              <a href="#" className="block py-2 text-gray-700 hover:text-indigo-600">Products</a>
              <a href="#" className="block py-2 text-gray-700 hover:text-indigo-600">About</a>
              <a href="#" className="block py-2 text-gray-700 hover:text-indigo-600">Contact</a>
            </div>
          )}
        </div>
      </nav>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 text-sm">
          Resize the preview to see the navigation change between desktop and mobile views.
          Click the hamburger menu icon on mobile to toggle the menu.
        </p>
      </div>
    </div>
  );
}
