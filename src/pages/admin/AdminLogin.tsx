import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Lock, LogIn } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const success = await login();
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setError('Unauthorized account. Only the admin can log in.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  const { loginWithRedirect } = useAppContext();
  const handleRedirectLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithRedirect();
    } catch (err: any) {
      setError(err.message || 'Failed to start redirect login');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-stone-100">
        <div>
          <div className="mx-auto h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900">
            Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-stone-600">
            Secure area for managing affiliate links and content.
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-70"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="h-5 w-5 text-emerald-500 group-hover:text-emerald-400" aria-hidden="true" />
                )}
              </span>
              Sign in with Google
            </button>

            <button
              onClick={handleRedirectLogin}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-stone-200 text-sm font-medium rounded-2xl text-stone-600 bg-white hover:bg-stone-50 focus:outline-none transition-colors disabled:opacity-70"
            >
              Trouble logging in? Try Redirect
            </button>
          </div>
          
          <p className="text-center text-xs text-stone-400">
            Redirect login is recommended for mobile browsers.
          </p>
        </div>
      </div>
    </div>
  );
};
