import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, Navbar } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { UsersPage } from './pages/UsersPage';
import { ActiveTab } from './types';
import { LoadingSpinner } from './components/UI';

const PAGE_TITLES: Record<ActiveTab, string> = {
  dashboard: 'Dashboard & Analytics',
  products: 'Products',
  orders: 'Orders',
  analytics: 'Analytics',
  recommendations: 'AI Recommendations',
  reports: 'Reports',
  monitoring: 'System Monitor',
  users: 'User Management',
};

const AppInner: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('boutiquely_dark') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('boutiquely_dark', String(darkMode));
  }, [darkMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <LoadingSpinner text="Loading Boutiquely AI…" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':  return <DashboardPage />;
      case 'products':   return <ProductsPage />;
      case 'orders':     return <OrdersPage />;
      case 'recommendations': return <RecommendationsPage />;
      case 'reports':    return <ReportsPage />;
      case 'monitoring': return <MonitoringPage />;
      case 'users':      return <UsersPage />;
      default:           return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} toggleDark={() => setDarkMode(d => !d)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar title={PAGE_TITLES[activeTab]} darkMode={darkMode} />
        <main className="flex-1 overflow-y-auto p-4 md:p-5">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider><AppInner /></AuthProvider>
);

export default App;
