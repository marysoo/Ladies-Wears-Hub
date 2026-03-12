import React, { useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { LayoutDashboard, ShoppingBag, Tag, FileText, LogOut } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { isAdmin, logout } = useAppContext();
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const navItems = [
    { name: 'Products', path: '/admin/dashboard', icon: ShoppingBag },
    { name: 'Deals & Coupons', path: '/admin/dashboard/deals', icon: Tag },
    { name: 'Site Settings', path: '/admin/dashboard/settings', icon: FileText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 sticky top-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-emerald-100 p-2 rounded-xl">
                <LayoutDashboard className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-stone-900">Admin Panel</h2>
            </div>
            
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-stone-100">
              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
