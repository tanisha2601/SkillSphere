import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import NotificationBell from '../NotificationBell';

export default function AdminLayout() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: '🔑' },
    { name: 'Manage Users', path: '/admin/manage-users', icon: '👥' },
    { name: 'Reports', path: '/admin/reports', icon: '📊' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link to="/" className="text-xl font-bold tracking-tight text-white">
            Skill<span className="text-brand-400">Sphere</span>{' '}
            <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded ml-2">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-rose-500/20 flex items-center justify-center font-bold text-rose-400">
              {user?.fullName?.[0] || 'A'}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                {user?.fullName || 'Administrator'}
              </p>
              <button
                onClick={() => dispatch(logout())}
                className="text-[10px] text-slate-300 hover:text-white transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-slate-800">Admin Control Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              System Live
            </span>
            <NotificationBell />
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
