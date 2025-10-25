
import React, { useState } from 'react';
import { useI18n } from '../context/i18n';
import LoadingSpinner from '../components/LoadingSpinner';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    // Simulate network request
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        onLoginSuccess();
      } else {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex w-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <div className="hidden md:block md:w-1/2 bg-primary-600 p-12 text-white flex flex-col justify-center relative">
           <div className="absolute top-0 left-0 w-full h-full bg-primary-700 opacity-20 transform -skew-y-12"></div>
           <div className="relative z-10">
              <h1 className="text-4xl font-bold">AdminPanel</h1>
              <p className="mt-4 text-primary-200">
                  Welcome back! Manage your entire SaaS platform from one central hub.
              </p>
           </div>
        </div>
        <div className="w-full p-8 md:w-1/2">
            <h2 className="text-2xl font-semibold text-center text-gray-700 dark:text-white">
                Welcome Back
            </h2>
            <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
                Please sign in to access the dashboard
            </p>
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm">
                <div>
                <label htmlFor="username" className="sr-only">
                    Username
                </label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    placeholder="Username (admin)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                </div>
                <div className="mt-4">
                <label htmlFor="password-input" className="sr-only">
                    Password
                </label>
                <input
                    id="password-input"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    placeholder="Password (admin123)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                </div>
            </div>

            {error && (
                <p className="text-sm text-center text-red-500">{error}</p>
            )}

            <div>
                <button
                type="submit"
                disabled={isLoading}
                className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white border border-transparent rounded-md group bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 dark:disabled:bg-primary-800 transition-colors"
                >
                {isLoading ? <LoadingSpinner /> : 'Sign in'}
                </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
