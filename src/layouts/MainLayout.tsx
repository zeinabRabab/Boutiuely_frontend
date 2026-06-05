import React, { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Sparkles,
  FileText, Activity, LogOut, Moon, Sun, Menu, X,
  ChevronRight, Users, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  toggleDark: () => void;
}

const menuItems = [
  { id: 'dashboard' as ActiveTab,       label: 'Dashboard',         icon: LayoutDashboard, adminOnly: false },
  { id: 'products' as ActiveTab,        label: 'Products',          icon: Package,         adminOnly: false },
  { id: 'orders' as ActiveTab,          label: 'Orders',            icon: ShoppingCart,    adminOnly: false },
  { id: 'recommendations' as ActiveTab, label: 'AI Recommendations',icon: Sparkles,        adminOnly: false },
  { id: 'users' as ActiveTab,           label: 'Users',             icon: Users,           adminOnly: true  },
  { id: 'reports' as ActiveTab,         label: 'Reports',           icon: FileText,        adminOnly: true  },
  { id: 'monitoring' as ActiveTab,      label: 'System Monitor',    icon: Activity,        adminOnly: true  },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, darkMode, toggleDark }) => {
  const { user, logout, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = menuItems.filter(item => !item.adminOnly || isAdmin);
  const roleBadgeColor = user?.role === 'admin'
    ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
    : user?.role === 'manager'
    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
    : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300';

  const roleLabel = (user?.role || 'cashier').charAt(0).toUpperCase() + (user?.role || 'cashier').slice(1);

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center p-3' : 'justify-between px-4 py-4'} border-b border-gray-100 dark:border-gray-800`}>
        {!collapsed && (
          <div>
            <h1 className="text-base font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              🛍️ Boutiquely
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">AI Platform v2.0</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          {collapsed ? <ChevronRight size={15}/> : <Menu size={15}/>}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-0.5 px-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
              title={collapsed ? item.label : undefined}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                ${collapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-200 dark:shadow-purple-900/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
            >
              <Icon size={17} className="flex-shrink-0"/>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.id === 'recommendations' && (
                <span className="ml-auto text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full">AI</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-2 space-y-1">
        <button
          onClick={toggleDark}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {!collapsed && user && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${roleBadgeColor}`}>{roleLabel}</span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={16}/>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className={`
        ${collapsed ? 'w-14' : 'w-56'}
        hidden md:flex flex-shrink-0 h-screen sticky top-0
        bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800
        flex-col transition-all duration-300 ease-in-out z-30
      `}>
        <NavContent/>
      </aside>

      {/* Mobile */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={18} className="text-gray-700 dark:text-gray-300"/>
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)}/>
          <aside className="relative z-50 w-56 bg-white dark:bg-gray-900 flex flex-col h-full shadow-xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={16} className="text-gray-500"/>
            </button>
            <NavContent/>
          </aside>
        </div>
      )}
    </>
  );
};

interface NavbarProps { title: string; darkMode: boolean; }

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user } = useAuth();
  return (
    <header className="h-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-20 md:ml-0 ml-10">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      <div className="flex items-center gap-2">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-gray-900 dark:text-white leading-tight">{user?.name}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
          {user?.name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
