import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  getFreelancerContracts,
  submitWork,
  updateProgress,
  clearContractError,
  clearContractSuccess,
} from '../../store/slices/contractSlice';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  Briefcase,
  CheckCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  CalendarDays,
  Sparkles,
  User,
  FolderOpen,
  Send,
} from 'lucide-react';
/* ------------------------------------------------------------------ */
const STATUS_STYLES = {
  active: {
    badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    dot: 'bg-cyan-400',
  },
  submitted: {
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  completed: {
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  cancelled: {
    badge: 'bg-red-500/10 text-red-300 border-red-500/20',
    dot: 'bg-red-400',
  },
};

const STATUS_TABS = ['all', 'active', 'submitted', 'completed', 'cancelled'];

/* ------------------------------------------------------------------ */
function SkeletonCard() {
  return (
    <div className="rounded-[36px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-8 animate-pulse">
      <div className="h-5 bg-white/10 rounded-lg w-2/3 mb-3" />
      <div className="h-4 bg-white/5 rounded-lg w-1/3 mb-6" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-3 bg-white/5 rounded w-1/2 mb-2" />
            <div className="h-4 bg-white/10 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export default function MyContracts() {
  const dispatch = useDispatch();
  const { contracts, loading, error, actionLoading } = useSelector((state) => state.contract);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    dispatch(getFreelancerContracts());
    return () => {
      dispatch(clearContractError());
      dispatch(clearContractSuccess());
    };
  }, [dispatch]);

  const handleSubmitWork = (id) => {
    if (!window.confirm('Submit your work to the client?')) return;

    dispatch(submitWork(id))
      .unwrap()
      .then(() => {
        toast.success('Work submitted successfully');
      })
      .catch((err) => {
        toast.error(err || 'Failed to submit work');
      });
  };

  const handleProgressChange = (id, progress) => {
    dispatch(
      updateProgress({
        contractId: id,
        progress,
      })
    )
      .unwrap()
      .then(() => {
        toast.success('Progress Updated');
      })
      .catch((err) => {
        toast.error(err || 'Failed to update progress');
      });
  };

  const filtered =
    activeTab === 'all' ? contracts : contracts.filter((c) => c.status === activeTab);

  const activeContracts = contracts.filter((c) => c.status === 'active').length;

  const completedContracts = contracts.filter((c) => c.status === 'completed').length;

  const totalRevenue = contracts.reduce((sum, c) => sum + (c.agreedBudget || 0), 0);

  const submittedContracts = contracts.filter((c) => c.status === 'submitted').length;

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen space-y-8 text-white">
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
        <div className="absolute w-[400px] h-[400px] rounded-full bg-emerald-500/20 blur-[150px] -top-24 right-0" />
        <div className="absolute w-[280px] h-[280px] rounded-full bg-cyan-500/10 blur-[130px] bottom-0 left-0" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <FolderOpen className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">My Contracts</h1>
            <p className="text-slate-400 mt-2 text-sm md:text-lg">
              Track projects, deliveries and earnings.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════ STATS ══════════════════════════ */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            title: 'Active Contracts',
            value: activeContracts,
            icon: Briefcase,
            color: '#22d3ee',
            bg: 'rgba(6,182,212,0.1)',
            border: 'rgba(6,182,212,0.2)',
          },
          {
            title: 'Submitted',
            value: submittedContracts,
            icon: Clock,
            color: '#fbbf24',
            bg: 'rgba(251,191,36,0.1)',
            border: 'rgba(251,191,36,0.2)',
          },
          {
            title: 'Completed',
            value: completedContracts,
            icon: CheckCircle,
            color: '#34d399',
            bg: 'rgba(52,211,153,0.1)',
            border: 'rgba(52,211,153,0.2)',
          },
          {
            title: 'Total Revenue',
            value: `$${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: '#4ade80',
            bg: 'rgba(74,222,128,0.1)',
            border: 'rgba(74,222,128,0.2)',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="
              group
              rounded-[30px]
              border border-white/10
              bg-white/[0.04]
              backdrop-blur-3xl
              p-6
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-emerald-500/30
              hover:shadow-2xl
              "
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: item.bg, border: `1px solid ${item.border}` }}
              >
                <Icon size={19} style={{ color: item.color }} />
              </div>

              <p className="text-slate-400 mt-4 text-xs font-bold uppercase tracking-widest">
                {item.title}
              </p>

              <h2 className="text-3xl md:text-4xl font-black mt-2" style={{ color: item.color }}>
                {item.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════ FILTERS ══════════════════════════ */}
      <div className="flex flex-wrap gap-3">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-5 py-2 rounded-2xl text-sm font-semibold capitalize transition-all duration-200 border
              ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-emerald-600 to-green-500 border-transparent text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ══════════════════════════ CONTENT ══════════════════════════ */}
      {loading ? (
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
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
            text-5xl
            "
          >
            📋
          </div>

          <h2 className="text-2xl md:text-3xl font-bold">No Contracts Found</h2>

          <p className="text-slate-500 mt-3">
            Contracts appear after proposal acceptance.
          </p>

          <Link
            to="/freelancer/find-jobs"
            className="
            inline-flex items-center gap-2
            mt-8
            px-6 py-3
            rounded-2xl
            bg-gradient-to-r
            from-emerald-600
            to-green-500
            text-white
            font-semibold
            shadow-lg shadow-emerald-500/20
            hover:scale-105
            active:scale-95
            transition-all
            "
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((contract) => {
            const style = STATUS_STYLES[contract.status] || STATUS_STYLES.active;
            const progressValue =
              contract.status === 'completed' ? 100 : contract.progress || 0;

            return (
              <div
                key={contract._id}
                className="
                rounded-[36px]
                border border-white/10
                bg-white/[0.04]
                backdrop-blur-3xl
                p-6 md:p-8
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-emerald-500/30
                hover:shadow-2xl
                "
              >
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 flex-wrap">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <User size={18} className="text-slate-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="text-xl md:text-2xl font-bold text-slate-100">
                            {contract.gig?.title}
                          </h2>

                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold border capitalize ${style.badge}`}
                          >
                            {contract.status}
                          </span>
                        </div>

                        <p className="text-slate-400 mt-2 text-sm">
                          Client: <span className="text-slate-200 font-medium">{contract.client?.fullName}</span>
                        </p>
                      </div>
                    </div>

                    {/* METRICS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                      <div>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                          Budget
                        </p>
                        <h3 className="text-xl md:text-2xl font-bold mt-2 text-emerald-300">
                          ${contract.agreedBudget?.toLocaleString()}
                        </h3>
                      </div>

                      <div>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                          Delivery
                        </p>
                        <h3 className="text-xl md:text-2xl font-bold mt-2">
                          {contract.deliveryTime}d
                        </h3>
                      </div>

                      <div>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                          Progress
                        </p>
                        <h3 className="text-xl md:text-2xl font-bold mt-2">{progressValue}%</h3>
                      </div>

                      <div>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <CalendarDays size={11} /> Created
                        </p>
                        <h3 className="text-base md:text-lg font-semibold mt-2 text-slate-300">
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </h3>
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="mt-8">
                      <div className="w-full h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700 ease-out"
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>
                    </div>

                    {/* TIMELINE */}
                    <div className="flex flex-wrap gap-3 mt-8">
                      <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium">
                        <CheckCircle2 size={14} />
                        Accepted
                      </div>

                      {contract.submittedAt && (
                        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium">
                          <Send size={14} />
                          Submitted
                        </div>
                      )}

                      {contract.approvedAt && (
                        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium">
                          <CheckCircle2 size={14} />
                          Approved
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-row lg:flex-col gap-3 lg:w-48 flex-shrink-0">
                    {contract.status === 'active' && (
                      <button
                        onClick={() => handleSubmitWork(contract._id)}
                        disabled={actionLoading}
                        className="
                        flex-1 lg:flex-none
                        px-6 py-3
                        rounded-2xl
                        bg-gradient-to-r
                        from-emerald-600
                        to-green-500
                        text-white
                        font-semibold
                        shadow-lg shadow-emerald-500/20
                        hover:scale-105
                        active:scale-95
                        transition-all
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        disabled:hover:scale-100
                        "
                      >
                        {actionLoading ? 'Submitting…' : 'Submit Work'}
                      </button>
                    )}

                    <Link
                      to={`/freelancer/contract/${contract._id}`}
                      className="
                      flex-1 lg:flex-none
                      px-6 py-3
                      rounded-2xl
                      bg-white/5
                      border border-white/10
                      text-center
                      font-semibold
                      hover:bg-white/10
                      hover:border-white/20
                      transition-all
                      "
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════ AI INSIGHTS ══════════════════════════ */}
      <div
        className="
        relative
        overflow-hidden
        rounded-[32px]
        border border-emerald-500/20
        p-8
        "
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.06) 100%)',
        }}
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20 blur-[70px] bg-emerald-400" />

        <div className="relative z-10 flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
            <Sparkles size={18} className="text-emerald-300" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-emerald-300">AI Insights</h3>
        </div>

        <div className="relative z-10 grid sm:grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, text: 'Completing projects faster may improve ratings.' },
            { icon: DollarSign, text: 'Web Development projects generate highest revenue.' },
            { icon: CheckCircle, text: 'Timely submissions increase client retention.' },
          ].map((insight, i) => {
            const Icon = insight.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-emerald-300" />
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{insight.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}