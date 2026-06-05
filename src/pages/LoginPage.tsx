import React, { useState } from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/UI';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        (err.response?.status === 401 ? 'Invalid email or password' : 'Login failed. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role: 'admin' | 'cashier') => {
    if (role === 'admin') {
      setEmail('admin@boutiquely.com');
      setPassword('admin123');
    } else {
      setEmail('cashier@boutiquely.com');
      setPassword('cashier123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛍️</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Boutiquely AI
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">AI-Powered Fashion Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Sign in to your dashboard</p>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@boutiquely.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">🧪 Quick Login</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="flex-1 text-xs py-1.5 px-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('cashier')}
                className="flex-1 text-xs py-1.5 px-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
              >
                Cashier
              </button>
            </div>
            <div className="mt-2 space-y-0.5">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">Admin:</span> admin@boutiquely.com / admin123
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">Cashier:</span> cashier@boutiquely.com / cashier123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
