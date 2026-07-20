import React from "react";
import {
  Link,
  NavLink,
  Outlet,
} from "react-router-dom";
import {
  useDispatch,
  useSelector,
} from "react-redux";

import { logout } from "../../store/slices/authSlice";
import NotificationBell from "../NotificationBell";

import {
  LayoutDashboard,
  User,
  Search,
  Briefcase,
  FileText,
  Handshake,
  MessageSquare,
  Wallet,
  LogOut,
  Sparkles,
  ChevronRight,
  Globe,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    path: "/freelancer/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Profile",
    path: "/freelancer/profile",
    icon: User,
  },
  {
    name: "Find Jobs",
    path: "/freelancer/find-jobs",
    icon: Search,
  },
  {
    name: "Manage Gigs",
    path: "/freelancer/manage-gigs",
    icon: Briefcase,
  },
  {
    name: "My Proposals",
    path: "/freelancer/my-proposals",
    icon: FileText,
  },
  {
    name: "My Contracts",
    path: "/freelancer/my-contracts",
    icon: Handshake,
  },
  {
    name: "Messages",
    path: "/freelancer/messages",
    icon: MessageSquare,
  },
  {
    name: "Wallet",
    path: "/freelancer/wallet",
    icon: Wallet,
  },
];

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || "F"
  );
}

export default function FreelancerLayout() {
  const dispatch = useDispatch();

  const { user } = useSelector(
    (state) => state.auth
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: "#060818",
      }}
    >
      {/* SIDEBAR */}

      <aside
        className="
        w-[240px]
        flex-shrink-0
        flex
        flex-col
        relative
        "
        style={{
          background:
            "rgba(6,8,24,0.95)",
          backdropFilter:
            "blur(32px)",
          borderRight:
            "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="
            absolute
            top-0
            left-0
            w-full
            min-h-[180px]
            opacity-30
            "
            style={{
              background:
                "radial-gradient(ellipse at 30% 0%, rgba(6,182,212,0.25) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* LOGO */}

        <div className="relative z-10 flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
          <div
            className="
            w-8 h-8
            rounded-xl
            flex
            items-center
            justify-center
            "
            style={{
              background:
                "linear-gradient(135deg,#06B6D4,#7C3AED)",
            }}
          >
            <Sparkles
              size={15}
              className="text-white"
            />
          </div>

          <div>
            <span className="text-white font-bold text-sm tracking-tight">
              SkillSphere
            </span>

            <div
              className="
              text-[9px]
              font-bold
              uppercase
              tracking-widest
              mt-0.5
              px-1.5
              py-0.5
              rounded-full
              w-fit
              "
              style={{
                background:
                  "rgba(6,182,212,0.15)",
                color: "#06B6D4",
              }}
            >
              Freelancer
            </div>
          </div>
        </div>

        {/* NAV */}

        <nav className="relative z-10 flex-1 overflow-y-auto px-3 py-5 space-y-1">
          {NAV_ITEMS.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({
                    isActive,
                  }) =>
                    `
                  flex items-center gap-3
                  px-4 py-3 rounded-2xl
                  transition-all duration-300
                  ${
                    isActive
                      ? `
                      bg-white/[0.06]
                      text-white
                      border border-white/10
                      shadow-lg
                      `
                      : `
                      text-slate-400
                      hover:bg-white/[0.04]
                      hover:text-white
                      `
                  }
                `
                  }
                >
                  <Icon
                    size={16}
                  />

                  <span className="flex-1 text-[13px] font-medium">
                    {item.name}
                  </span>

                  <ChevronRight
                    size={12}
                    className="opacity-30"
                  />
                </NavLink>
              );
            }
          )}
        </nav>

        {/* USER */}

        <div className="relative z-10 p-4 border-t border-white/[0.06]">
          <div
            className="
            flex items-center gap-3
            p-3 rounded-2xl
            "
            style={{
              background:
                "rgba(255,255,255,0.03)",
            }}
          >
            <div
              className="
              w-9 h-9
              rounded-full
              flex
              items-center
              justify-center
              font-bold
              text-sm
              "
              style={{
                background:
                  "linear-gradient(135deg,#06B6D440,#7C3AED40)",
                border:
                  "1px solid rgba(6,182,212,0.3)",
                color:
                  "#67e8f9",
              }}
            >
              {getInitials(
                user?.fullName
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user?.fullName ||
                  "Freelancer"}
              </p>

              <p className="text-[10px] text-slate-500 truncate">
                {user?.email}
              </p>
            </div>

            <button
              onClick={() =>
                dispatch(
                  logout()
                )
              }
              className="
              p-1.5 rounded-lg
              text-slate-500
              hover:text-red-400
              hover:bg-red-500/10
              transition
              "
            >
              <LogOut
                size={13}
              />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}

      <div className="flex-1 flex flex-col min-w-0 overflow-visible">

        {/* HEADER */}

        <header
          className="
          h-[60px]
          flex
          items-center
          justify-between
          px-8
          relative
          z-20
          "
          style={{
            background:
              "rgba(6,8,24,0.85)",
            backdropFilter:
              "blur(24px)",
            borderBottom:
              "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span className="text-sm font-semibold text-slate-400">
            Freelancer Workspace
          </span>

          <div className="flex items-center gap-3">
            <Link
              to="/services"
              className="
              flex items-center gap-1.5
              text-xs font-semibold
              text-slate-400
              hover:text-cyan-300
              transition-colors
              px-3 py-1.5
              rounded-xl
              hover:bg-cyan-500/10
              "
            >
              <Globe
                size={13}
              />
              Browse Jobs
            </Link>

            <div className="h-4 w-px bg-white/10" />

            <NotificationBell />
          </div>
        </header>

        {/* CONTENT */}

        <main className="flex-1 overflow-y-auto overflow-x-visible">
          <div
            className="
            fixed inset-0
            -z-10
            pointer-events-none
            overflow-hidden
            "
            style={{
              background:
                "#060818",
            }}
          >
            <div className="absolute inset-0 grid-bg opacity-60" />

            <div
              className="
              blur-orb
              w-[600px]
              h-[600px]
              top-[-100px]
              right-[10%]
              opacity-[0.12]
              "
              style={{
                background:
                  "radial-gradient(circle,#7C3AED,transparent)",
              }}
            />

            <div
              className="
              blur-orb
              w-[500px]
              h-[500px]
              bottom-[-100px]
              left-[5%]
              opacity-[0.10]
              "
              style={{
                background:
                  "radial-gradient(circle,#06B6D4,transparent)",
              }}
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