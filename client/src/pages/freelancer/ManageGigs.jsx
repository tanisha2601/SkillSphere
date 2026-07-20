import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllGigs, clearGigError } from '../../store/slices/gigSlice';
import {
  Compass,
  Briefcase,
  DollarSign,
  Sparkles,
  AlertTriangle,
  Wrench,
  Clock3,
  ArrowRight,
} from 'lucide-react';

export default function ManageGigs() {
  const dispatch = useDispatch();
  const { gigs, loading, error } = useSelector((state) => state.gig);

  useEffect(() => {
    dispatch(getAllGigs());
    return () => {
      dispatch(clearGigError());
    };
  }, [dispatch]);

  // Show only open gigs to the freelancer
  const openGigs = gigs.filter((g) => g.status === 'open');

  const avgBudget = openGigs.length
    ? Math.round(openGigs.reduce((sum, g) => sum + (g.budget || 0), 0) / openGigs.length)
    : 0;

  return (
    <div className="space-y-8 text-white">
      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <div
        className="
        relative
        overflow-hidden
        rounded-[36px]
        border border-white/10
        bg-white/[0.04]
        backdrop-blur-3xl
        p-8 md:p-10
        "
      >
        <div className="absolute w-[380px] h-[380px] rounded-full bg-cyan-500/20 blur-[140px] -top-24 -right-10" />
        <div className="absolute w-[280px] h-[280px] rounded-full bg-purple-600/15 blur-[130px] bottom-0 left-0" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Compass className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Browse Projects</h1>
              <p className="text-slate-400 mt-2 text-sm md:text-lg max-w-2xl">
                Explore active client projects and apply to opportunities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Briefcase size={16} className="text-cyan-300" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Open Projects
                </p>
                <p className="text-2xl font-black mt-0.5">{openGigs.length}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <DollarSign size={16} className="text-emerald-300" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Average Budget
                </p>
                <p className="text-2xl font-black mt-0.5">${avgBudget.toLocaleString()}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-purple-300" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-purple-300/70">
                  AI Recommendations
                </p>
                <p className="text-sm font-bold mt-0.5 text-purple-200">Enabled</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════ LOADING ══════════════════════════ */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-6 animate-pulse"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-16 bg-white/10 rounded-full" />
                <div className="h-4 w-24 bg-white/5 rounded" />
              </div>
              <div className="h-5 w-2/3 bg-white/10 rounded-lg mb-2" />
              <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════ ERROR ══════════════════════════ */}
      {!loading && error && (
        <div
          className="
          relative
          overflow-hidden
          rounded-[36px]
          border border-red-500/20
          bg-white/[0.04]
          backdrop-blur-3xl
          p-12
          text-center
          "
        >
          <div className="absolute w-[260px] h-[260px] rounded-full bg-red-500/15 blur-[110px] -top-16 left-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle size={26} className="text-red-300" />
            </div>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">{error}</p>
            <button
              onClick={() => dispatch(getAllGigs())}
              className="
              mt-6
              px-6 py-2.5
              rounded-2xl
              bg-gradient-to-r
              from-red-600
              to-rose-500
              text-white
              text-sm font-semibold
              shadow-lg shadow-red-500/20
              hover:scale-105
              active:scale-95
              transition-all
              "
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════ EMPTY ══════════════════════════ */}
      {!loading && !error && openGigs.length === 0 && (
        <div
          className="
          rounded-[36px]
          border border-white/10
          bg-white/[0.04]
          backdrop-blur-3xl
          p-16 md:p-20
          text-center
          "
        >
          <div
            className="
            w-20 h-20
            mx-auto
            mb-6
            rounded-3xl
            flex items-center justify-center
            bg-white/[0.03]
            border border-white/10
            "
          >
            <Wrench size={30} className="text-slate-500" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-200">
            No open projects right now
          </h3>
          <p className="text-slate-500 mt-3 text-sm max-w-sm mx-auto">
            Check back soon — clients post new projects regularly.
          </p>
        </div>
      )}

      {/* ══════════════════════════ PROJECT LIST ══════════════════════════ */}
      {!loading && !error && openGigs.length > 0 && (
        <div className="space-y-4">
          {openGigs.map((gig) => (
            <Link
              key={gig._id}
              to={`/gig/${gig._id}`}
              className="
              group
              relative
              block
              overflow-hidden
              rounded-[32px]
              border border-white/10
              bg-white/[0.04]
              backdrop-blur-3xl
              p-6
              transition-all duration-300
              hover:-translate-y-1
              hover:border-cyan-500/30
              hover:shadow-2xl
              "
            >
              {/* Subtle animated gradient overlay on hover */}
              <div
                className="
                pointer-events-none
                absolute inset-0
                opacity-0
                group-hover:opacity-100
                transition-opacity duration-500
                bg-gradient-to-r
                from-cyan-500/[0.03]
                via-transparent
                to-blue-500/[0.03]
                "
              />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex gap-4 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-cyan-500/10">
                    {gig.client?.fullName?.[0] || 'C'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        Open
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                        {gig.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {gig.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-1">{gig.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 flex-shrink-0 pl-16 sm:pl-0">
                  <div className="text-right">
                    <p className="text-lg font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                      ${gig.budget?.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 justify-end mt-0.5">
                      <Clock3 size={11} />
                      {gig.deliveryTime} days
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 transition-all">
                    <ArrowRight size={15} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}