import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-20 items-center justify-between">
            <Link to="/" className="text-3xl font-bold tracking-tight">
              <span className="text-white">Skill</span>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Sphere
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-10 text-sm text-slate-300">
              <Link to="/services" className="hover:text-blue-400 transition">
                Explore
              </Link>

              <Link to="/freelancer/dashboard" className="hover:text-blue-400 transition">
                Freelancers
              </Link>

              <Link to="/client/dashboard" className="hover:text-blue-400 transition">
                Clients
              </Link>
            </nav>

            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-5 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:scale-105 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-[#020617] border-t border-white/10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <h2 className="text-3xl font-bold">
                <span className="text-white">Skill</span>

                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Sphere
                </span>
              </h2>

              <p className="mt-5 text-slate-400 leading-7">
                Intelligent Hyperlocal Freelance Ecosystem powered by AI.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-5">Platform</h3>

              <div className="space-y-3 text-slate-400">
                <p>Find Work</p>
                <p>Hire Talent</p>
                <p>Browse Services</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-5">Resources</h3>

              <div className="space-y-3 text-slate-400">
                <p>Documentation</p>
                <p>Community</p>
                <p>Support</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-5">Contact</h3>

              <div className="space-y-3 text-slate-400">
                <p>support@skillsphere.ai</p>
                <p>India</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-16 pt-8 text-center text-slate-300">
            © {new Date().getFullYear()} SkillSphere. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
