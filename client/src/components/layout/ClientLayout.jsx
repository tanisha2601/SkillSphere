import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import NotificationBell from '../NotificationBell';
import {
  LayoutDashboard,
  FilePlus,
  FolderKanban,
  Handshake,
  MessageSquare,
  CreditCard,
  LogOut,
  Sparkles,
  ChevronRight,
  Globe,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard',         path: '/client/dashboard',        icon: LayoutDashboard },
  { name: 'Post a Job',        path: '/client/post-job',         icon: FilePlus },
  { name: 'My Projects',       path: '/client/manage-gigs',      icon: FolderKanban },
  { name: 'Contracts',         path: '/client/manage-contracts', icon: Handshake },
  { name: 'Messages',          path: '/client/messages',         icon: MessageSquare },
  { name: 'Payments',          path: '/client/payment-history',  icon: CreditCard },
];

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]?.toUpperCase()).join('') || 'C';
}

export default function ClientLayout() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#060818' }}>

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside
        className="w-[240px] flex-shrink-0 flex flex-col relative"
        style={{
          background: 'rgba(6,8,24,0.95)',
          backdropFilter: 'blur(32px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Subtle side gradient */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full h-[300px] opacity-30"
            style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(124,58,237,0.25) 0%, transparent 70%)' }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
          >
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-tight">SkillSphere</span>
            <div
              className="text-[9px] font-bold uppercase tracking-widest mt-0.5 px-1.5 py-0.5 rounded-full w-fit"
              style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}
            >
              Client
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex-1 overflow-y-auto px-3 py-5 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1 text-[13px]">{item.name}</span>
                <ChevronRight size={12} className="opacity-30" />
              </NavLink>
            );
          })}
        </nav>

        {/* User card */}
        <div className="relative z-10 p-4 border-t border-white/[0.06]">
          <div
            className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 cursor-pointer group"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C3AED40, #06B6D440)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}
            >
              {getInitials(user?.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.fullName || 'Client'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => dispatch(logout())}
              className="p-1.5 rounded-lg transition-all hover:bg-red-500/10 hover:text-red-400 text-slate-500"
              title="Sign Out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-visible">

        {/* Top Header */}
        <header
          className="flex-shrink-0 h-[60px] flex items-center justify-between px-8 relative z-20"
          style={{
            background: 'rgba(6,8,24,0.85)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-400">Client Workspace</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/services"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-violet-300 transition-colors px-3 py-1.5 rounded-xl hover:bg-violet-500/10"
            >
              <Globe size={13} />
              Browse Services
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
       <main className="flex-1 overflow-y-auto overflow-x-visible">
          {/* Persistent bg decorations */}
          <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" style={{ background: '#060818' }}>
            <div className="absolute inset-0 grid-bg opacity-60" />
            <div
              className="blur-orb w-[600px] h-[600px] top-[-100px] right-[10%] opacity-[0.12]"
              style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }}
            />
            <div
              className="blur-orb w-[500px] h-[500px] bottom-[-100px] left-[5%] opacity-[0.1]"
              style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }}
            />
          </div>

          <div className="max-w-[1280px] mx-auto px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
