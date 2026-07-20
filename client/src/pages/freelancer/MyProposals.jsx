import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  getMyProposals,
  withdrawProposal,
  clearProposalError,
  clearProposalSuccess,
} from '../../store/slices/proposalSlice';
import toast from 'react-hot-toast';
import {
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  Undo2,
  Inbox,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
const STATUS_STYLES = {
  pending: {
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  accepted: {
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  rejected: {
    badge: 'bg-red-500/10 text-red-300 border-red-500/20',
    dot: 'bg-red-400',
  },
  withdrawn: {
    badge: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    dot: 'bg-slate-400',
  },
};

const STATUS_TABS = ['all', 'pending', 'accepted', 'rejected', 'withdrawn'];

/* ------------------------------------------------------------------ */
function SkeletonCard() {
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-6 animate-pulse">
      <div className="h-5 bg-white/10 rounded-lg w-2/3 mb-3" />
      <div className="h-4 bg-white/5 rounded-lg w-1/4 mb-4" />
      <div className="h-12 bg-white/5 rounded-xl mb-4" />
      <div className="flex gap-3">
        <div className="h-8 bg-white/10 rounded-xl w-24" />
        <div className="h-8 bg-white/10 rounded-xl w-24" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export default function MyProposals() {
  const dispatch = useDispatch();
  const { proposals, loading, error, actionLoading } = useSelector((state) => state.proposal);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    dispatch(getMyProposals());
    return () => {
      dispatch(clearProposalError());
      dispatch(clearProposalSuccess());
    };
  }, [dispatch]);

  const handleWithdraw = (proposalId) => {
    if (!window.confirm('Withdraw this proposal?')) return;

    dispatch(withdrawProposal(proposalId))
      .unwrap()
      .then(() => {
        toast.success('Proposal withdrawn successfully');
      })
      .catch((err) => {
        toast.error(err || 'Failed to withdraw proposal');
      });
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const filtered =
    activeTab === 'all' ? proposals : proposals.filter((p) => p.status === activeTab);

  const countByStatus = (status) => proposals.filter((p) => p.status === status).length;

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
        <div className="absolute w-[420px] h-[420px] rounded-full bg-cyan-500/20 blur-[150px] -top-32 -right-10" />
        <div className="absolute w-[280px] h-[280px] rounded-full bg-blue-600/20 blur-[130px] bottom-0 left-0" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div
              className="
              w-14 h-14
              rounded-2xl
              bg-gradient-to-r
              from-blue-500
              to-cyan-400
              flex items-center justify-center
              shadow-lg shadow-cyan-500/20
              "
            >
              <Send className="text-white" size={22} />
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">My Proposals</h2>
              <p className="text-slate-400 mt-1 text-sm md:text-base">
                Track all submitted proposals and monitor their status.
              </p>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Proposals',
                value: proposals.length,
                icon: FileText,
                color: '#60a5fa',
                bg: 'rgba(59,130,246,0.1)',
                border: 'rgba(59,130,246,0.2)',
              },
              {
                label: 'Pending',
                value: countByStatus('pending'),
                icon: Clock,
                color: '#fbbf24',
                bg: 'rgba(251,191,36,0.1)',
                border: 'rgba(251,191,36,0.2)',
              },
              {
                label: 'Accepted',
                value: countByStatus('accepted'),
                icon: CheckCircle2,
                color: '#34d399',
                bg: 'rgba(52,211,153,0.1)',
                border: 'rgba(52,211,153,0.2)',
              },
              {
                label: 'Rejected',
                value: countByStatus('rejected'),
                icon: XCircle,
                color: '#f87171',
                bg: 'rgba(248,113,113,0.1)',
                border: 'rgba(248,113,113,0.2)',
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="
                  group
                  rounded-[24px]
                  border border-white/10
                  bg-white/[0.03]
                  backdrop-blur-xl
                  p-5
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-2xl
                  hover:border-white/20
                  "
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
                  >
                    <Icon size={17} style={{ color: stat.color }} />
                  </div>
                  <p className="text-slate-400 mt-4 text-[11px] font-bold uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-black mt-1" style={{ color: stat.color }}>
                    {stat.value}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════ STATUS FILTERS ══════════════════════════ */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold capitalize transition-all duration-200 border ${
              activeTab === tab
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 border-transparent text-white shadow-lg shadow-cyan-500/20'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            {tab}
            {tab !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">({countByStatus(tab)})</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════ CONTENT ══════════════════════════ */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
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
            <Inbox size={32} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-200">
            No {activeTab === 'all' ? '' : activeTab} proposals
          </h3>
          <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">
            {activeTab === 'all'
              ? 'Start applying to jobs to see your proposals here.'
              : `You have no ${activeTab} proposals.`}
          </p>
          {activeTab === 'all' && (
            <Link
              to="/freelancer/find-jobs"
              className="
              mt-6
              inline-flex items-center gap-2
              px-6 py-3
              rounded-2xl
              bg-gradient-to-r
              from-blue-600
              to-cyan-500
              text-white
              text-sm font-semibold
              shadow-lg shadow-cyan-500/20
              hover:scale-105
              active:scale-95
              transition-all duration-200
              "
            >
              Browse Jobs
            </Link>
          )}
        </div>
      ) : (
        /* Proposal Cards */
        <div className="space-y-4">
          {filtered.map((proposal) => {
            const style = STATUS_STYLES[proposal.status] || STATUS_STYLES.pending;
            return (
              <div
                key={proposal._id}
                className="
                rounded-[32px]
                border border-white/10
                bg-white/[0.04]
                backdrop-blur-3xl
                p-6 md:p-7
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-2xl
                hover:border-cyan-500/30
                "
              >
                <div className="flex justify-between items-start flex-wrap gap-4">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-100 truncate">
                        {proposal.gig?.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.badge}`}
                      >
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mt-1">
                      Category:{' '}
                      <span className="font-medium text-slate-300">{proposal.gig?.category}</span>
                    </p>

                    <p className="mt-3 text-sm text-slate-400 line-clamp-2">
                      {proposal.coverLetter}
                    </p>

                    <div className="flex flex-wrap gap-6 mt-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                          Your Bid
                        </p>
                        <p className="font-bold text-slate-100">
                          ${proposal.proposedBudget?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                          Delivery
                        </p>
                        <p className="font-bold text-slate-100">{proposal.deliveryTime} days</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                          Submitted
                        </p>
                        <p className="font-bold text-slate-100">
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 items-stretch sm:items-end w-full sm:w-auto">
                    <Link
                      to={`/gig/${proposal.gig?._id}`}
                      className="
                      inline-flex items-center justify-center gap-1.5
                      px-4 py-2
                      rounded-xl
                      border border-white/10
                      bg-white/5
                      hover:bg-white/10
                      hover:border-white/20
                      text-slate-200
                      font-semibold text-sm
                      transition-all
                      "
                    >
                      <ExternalLink size={14} />
                      View Gig
                    </Link>

                    {proposal.status === 'pending' && (
                      <button
                        onClick={() => handleWithdraw(proposal._id)}
                        disabled={actionLoading}
                        className="
                        inline-flex items-center justify-center gap-1.5
                        px-4 py-2
                        rounded-xl
                        bg-gradient-to-r
                        from-red-600
                        to-rose-600
                        text-white
                        font-semibold text-sm
                        shadow-lg shadow-red-500/10
                        hover:scale-105
                        active:scale-95
                        transition-all
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        disabled:hover:scale-100
                        "
                      >
                        <Undo2 size={14} />
                        {actionLoading ? 'Withdrawing…' : 'Withdraw'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Status timeline */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="flex gap-3 items-center">
                    <span className="relative flex h-2.5 w-2.5">
                      {proposal.status === 'pending' && (
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${style.dot} opacity-60`}
                        />
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${style.dot}`}
                      />
                    </span>
                    <p className="text-xs text-slate-400">
                      {proposal.status === 'pending' && 'Waiting for client review'}
                      {proposal.status === 'accepted' &&
                        'Congratulations! Your proposal was accepted and a contract has been created.'}
                      {proposal.status === 'rejected' && 'This proposal was not selected.'}
                      {proposal.status === 'withdrawn' && 'You withdrew this proposal.'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}