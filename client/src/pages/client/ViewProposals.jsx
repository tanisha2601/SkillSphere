import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  getGigProposals,
  acceptProposal,
  rejectProposal,
  clearProposalError,
  clearProposalSuccess,
} from '../../store/slices/proposalSlice';
import {
  Star,
  DollarSign,
  Clock,
  CheckCircle,
  X,
  Users,
  Inbox,
  ArrowUpRight,
  Mail,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';

const STATUS_CHIP = {
  accepted: 'chip chip-emerald',
  rejected: 'chip chip-rose',
  pending: 'chip chip-amber',
};

const STATUS_LEFT = {
  accepted: 'rgba(52,211,153,0.6)',
  rejected: 'rgba(251,113,133,0.4)',
  pending: 'rgba(251,191,36,0.5)',
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] },
  }),
};

function getInitials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('') || '?'
  );
}

function StarRating({ rating = 0 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}
        />
      ))}
      <span className="text-xs font-bold text-slate-400 ml-1">
        {rating ? rating.toFixed(1) : '0.0'}
      </span>
    </div>
  );
}

export default function ViewProposals() {
  const { gigId } = useParams();
  const dispatch = useDispatch();
  const { proposals, loading, error, success } = useSelector((s) => s.proposal);

  useEffect(() => {
    dispatch(getGigProposals(gigId));
    return () => {
      dispatch(clearProposalError());
      dispatch(clearProposalSuccess());
    };
  }, [dispatch, gigId]);

  const handleAccept = (id) => {
    if (!window.confirm('Accept this proposal?')) return;
    dispatch(acceptProposal(id))
      .unwrap()
      .then(() => toast.success('Proposal accepted successfully'))
      .catch((err) => toast.error(err || 'Failed to accept proposal'));
  };

  const handleReject = (id) => {
    if (!window.confirm('Reject this proposal?')) return;
    dispatch(rejectProposal(id))
      .unwrap()
      .then(() => toast.success('Proposal rejected'))
      .catch((err) => toast.error(err || 'Failed to reject proposal'));
  };

  /* Counts */
  const pending = proposals.filter((p) => p.status === 'pending').length;
  const accepted = proposals.filter((p) => p.status === 'accepted').length;
  const rejected = proposals.filter((p) => p.status === 'rejected').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="shimmer rounded-[32px] h-40" />
        <div className="grid md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shimmer rounded-[24px] h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 rounded-[28px] text-center"
        style={{ background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.2)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(251,113,133,0.12)' }}
        >
          <X size={28} className="text-rose-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-200 mb-2">Error Loading Proposals</h3>
        <p className="text-slate-500 text-sm max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      {/* ── HERO ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-[32px] p-10"
        style={{
          background:
            'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(124,58,237,0.06) 100%)',
          border: '1px solid rgba(251,191,36,0.18)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.6), transparent)',
            filter: 'blur(60px)',
          }}
        />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            Proposal Review
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Freelancer Proposals</h1>
          <p className="text-slate-400 mt-2 text-base">
            Review applications, compare budgets, and select the best fit for your project.
          </p>
          {proposals.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                {
                  label: `${pending} Pending`,
                  color: '#fbbf24',
                  bg: 'rgba(251,191,36,0.12)',
                  border: 'rgba(251,191,36,0.25)',
                },
                {
                  label: `${accepted} Accepted`,
                  color: '#34d399',
                  bg: 'rgba(52,211,153,0.12)',
                  border: 'rgba(52,211,153,0.25)',
                },
                {
                  label: `${rejected} Rejected`,
                  color: '#fb7185',
                  bg: 'rgba(251,113,133,0.12)',
                  border: 'rgba(251,113,133,0.25)',
                },
              ].map((p) => (
                <span
                  key={p.label}
                  className="px-4 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}` }}
                >
                  {p.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── EMPTY STATE ── */}
      {proposals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 rounded-[28px] text-center"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            className="w-24 h-24 rounded-[36px] flex items-center justify-center mb-6 text-5xl"
            style={{
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.15)',
            }}
          >
            📭
          </div>
          <h3 className="text-xl font-bold text-slate-200">No proposals yet</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-xs leading-relaxed">
            Freelancers haven't applied to this project yet. Your post is live and visible to
            talent.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {proposals.map((proposal, pi) => {
            const lb = STATUS_LEFT[proposal.status] || 'rgba(148,163,184,0.4)';
            return (
              <motion.div
                key={proposal._id}
                custom={pi}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="relative rounded-[24px] overflow-hidden transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                }}
              >
                {/* Status left bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]"
                  style={{ background: lb }}
                />

                <div className="p-8 pl-9">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Freelancer info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        {/* Avatar */}
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
                        >
                          {getInitials(proposal.freelancer?.fullName)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-100">
                            {proposal.freelancer?.fullName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail size={11} className="text-slate-500" />
                            <p className="text-xs text-slate-500">{proposal.freelancer?.email}</p>
                          </div>
                          <div className="mt-1.5">
                            <StarRating rating={proposal.freelancer?.averageRating} />
                            <span className="text-[10px] text-slate-600 ml-0.5">
                              ({proposal.freelancer?.totalReviews || 0} reviews)
                            </span>
                          </div>
                        </div>
                        <div className="ml-auto">
                          <span className={STATUS_CHIP[proposal.status] || 'chip chip-slate'}>
                            {proposal.status}
                          </span>
                        </div>
                      </div>

                      {/* Proposal metrics */}
                      <div className="flex flex-wrap gap-4 mb-5">
                        <div
                          className="px-4 py-3 rounded-2xl flex items-center gap-2"
                          style={{
                            background: 'rgba(6,182,212,0.08)',
                            border: '1px solid rgba(6,182,212,0.15)',
                          }}
                        >
                          <DollarSign size={14} className="text-cyan-300" />
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                              Proposed Budget
                            </p>
                            <p className="text-base font-black text-cyan-300">
                              ${proposal.proposedBudget?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div
                          className="px-4 py-3 rounded-2xl flex items-center gap-2"
                          style={{
                            background: 'rgba(251,191,36,0.08)',
                            border: '1px solid rgba(251,191,36,0.15)',
                          }}
                        >
                          <Clock size={14} className="text-amber-300" />
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                              Delivery Time
                            </p>
                            <p className="text-base font-black text-amber-300">
                              {proposal.deliveryTime} days
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cover letter */}
                      <div
                        className="p-5 rounded-2xl mb-4"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                          Cover Letter
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                          {proposal.coverLetter}
                        </p>
                      </div>
                    </div>

                    {/* Action column */}
                    {proposal.status === 'pending' && (
                      <div className="flex md:flex-col gap-3 md:min-w-[160px]">
                        <button
                          onClick={() => handleAccept(proposal._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all"
                          style={{
                            background: 'linear-gradient(135deg, #059669, #34d399)',
                            color: '#fff',
                            boxShadow: '0 8px 24px rgba(52,211,153,0.3)',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          <CheckCircle size={15} /> Accept
                        </button>
                        <button
                          onClick={() => handleReject(proposal._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all"
                          style={{
                            background: 'rgba(251,113,133,0.1)',
                            border: '1px solid rgba(251,113,133,0.25)',
                            color: '#fb7185',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(251,113,133,0.18)';
                            e.currentTarget.style.transform = 'scale(1.03)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(251,113,133,0.1)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <X size={15} /> Decline
                        </button>
                      </div>
                    )}
                    {proposal.status === 'accepted' && (
                      <div
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold flex-shrink-0"
                        style={{
                          background: 'rgba(52,211,153,0.1)',
                          border: '1px solid rgba(52,211,153,0.2)',
                          color: '#34d399',
                        }}
                      >
                        <CheckCircle size={14} /> Hired
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
