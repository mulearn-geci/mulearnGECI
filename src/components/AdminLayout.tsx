import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Users,
  GraduationCap,
  Trophy,
  Sparkles,
  LogOut,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DarkModeToggle from './DarkModeToggle';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Homepage Customizer', href: '/admin/homepage', icon: Sparkles },
    { name: 'Posts', href: '/admin/posts', icon: FileText },
    { name: 'Events', href: '/admin/events', icon: Calendar },
    { name: 'Execom Team', href: '/admin/execom', icon: Users },
    { name: 'Alumni Network', href: '/admin/alumni', icon: GraduationCap },
    { name: 'Leaderboard Stats', href: '/admin/leaderboard', icon: Trophy },
  ];

  const quickTabs = [
    { name: 'Execom Team', href: '/admin/execom', icon: Users },
    { name: 'Alumni Network', href: '/admin/alumni', icon: GraduationCap },
    { name: 'Leaderboard Stats', href: '/admin/leaderboard', icon: Trophy },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-75"></div>
        </div>
      )}

      {/* Fixed Sidebar */}
      <aside className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between flex-shrink-0`}>
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-none">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">µ</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">µLearn Admin</span>
            </Link>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-gray-400 dark:text-gray-300" />
            </button>
          </div>

          <nav className="mt-6 px-4 flex-1">
            <ul className="space-y-1.5">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* User info & Sign Out permanently pinned at bottom-left */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              <span>{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-xl transition-colors shadow-sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Admin Top Header & Quick Switch Tabs */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Quick Switch Tabs */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-900/80 p-1 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto max-w-full scrollbar-none">
              {quickTabs.map((tab) => {
                const active = isActive(tab.href);
                return (
                  <Link
                    key={tab.name}
                    to={tab.href}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center space-x-1 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700/60 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <DarkModeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}