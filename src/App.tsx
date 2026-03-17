/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { About, Contact, Privacy } from './pages/Pages';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageProducts } from './pages/admin/ManageProducts';
import { ManageDeals } from './pages/admin/ManageDeals';
import { ManageSettings } from './pages/admin/ManageSettings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAppContext } from './context/AppContext';

function AppContent() {
  const { isAuthReady } = useAppContext();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-600 font-medium animate-pulse">Initializing Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          
          <Route path="admin" element={<AdminLogin />} />
          <Route path="admin/dashboard" element={<AdminDashboard />}>
            <Route index element={<ManageProducts />} />
            <Route path="deals" element={<ManageDeals />} />
            <Route path="settings" element={<ManageSettings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <CurrencyProvider>
          <AppContent />
        </CurrencyProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
