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

export default function App() {
  return (
    <AppProvider>
      <CurrencyProvider>
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
      </CurrencyProvider>
    </AppProvider>
  );
}
