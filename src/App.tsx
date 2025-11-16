import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PagesList } from './components/admin/PagesList';
import { PageBuilder } from './components/admin/PageBuilder';
import { PageView } from './pages/PageView';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<PagesList />} />
        <Route path="/admin/pages/new" element={<PageBuilder />} />
        <Route path="/admin/pages/:slug" element={<PageBuilder />} />

        {/* Public Pages */}
        <Route path="/:slug" element={<PageView />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
