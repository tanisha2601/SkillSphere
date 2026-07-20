import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  getClientContracts,
  approveWork,
  clearContractError,
  clearContractSuccess,
} from '../../store/slices/contractSlice';
import {
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  Briefcase,
  Sparkles,
  Target,
  ChevronRight,
  Calendar,
  Users,
  TrendingUp,
  Filter,
  SlidersHorizontal,
  ArrowUpRight,
  CheckCheck,
  AlertTriangle,
} from 'lucide-react';

const STATUS_TABS = ['all', 'active', 'submitted', 'completed', 'cancelled'];

const STATUS_CHIP = {
  active: 'chip chip-cyan',
  submitted: 'chip chip-amber',
  completed: 'chip chip-emerald',
  cancelled: 'chip chip-rose',
};

const STATUS_LEFT_BORDER = {
  active: 'rgba(6,182,212,0.6)',
  submitted: 'rgba(251,191,36,0.6)',
  completed: 'rgba(52,211,153,0.6)',
  cancelled: 'rgba(251,113,133,0.4)',
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.4, 0, 0.2, 1] },
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

function SkeletonCard() {
  return <div className="shimmer rounded-[24px] h-[280px]" />;
}

export default function ManageContracts() {
  const dispatch = useDispatch();
  const { contracts, loading, actionLoading } = useSelector((s) => s.contract);

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    dispatch(getClientContracts());
    return () => {
      dispatch(clearContractError());
      dispatch(clearContractSuccess());
    };
  }, [dispatch]);

  const handleApprove = (id) => {
    if (!window.confirm('Approve this submitted work?')) return;
    dispatch(approveWork(id))
      .unwrap()
      .then(() => toast.success('Work approved successfully'))
      .catch((err) => toast.error(err || 'Failed to approve work'));
  };

  /* Aggregates */
  const activeContracts = contracts.filter((c) => c.status === 'active').length;
  const completedContracts = contracts.filter((c) => c.status === 'completed').length;
  const submittedContracts = contracts.filter((c) => c.status === 'submitted').length;
  const totalSpend = contracts
    .filter((c) => c.status === 'completed')
    .reduce((s, c) => s + (c.agreedBudget || 0), 0);

  const filtered = contracts
    .filter((c) => {
      const statusMatch = activeTab === 'all' ? true : c.status === activeTab;
      const searchMatch =
        c.gig?.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.freelancer?.fullName?.toLowerCase().includes(search.toLowerCase());
      return statusMatch && searchMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'budget') return b.agreedBudget - a.agreedBudget;
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const metrics = [
    {
      title: 'Active',
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
      title: 'Total Spent',
      value: `$${totalSpend.toLocaleString()}`,
      icon: DollarSign,
      color: '#a78bfa',
      bg: 'rgba(124,58,237,0.1)',
      border: 'rgba(124,58,237,0.2)',
    },
  ];

  return (
    <div className="space-y-8 text-white">
      {/* ── HERO ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-[32px] p-10"
        style={{
          background: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(124,58,237,0.07) 100%)',
          border: '1px solid rgba(6,182,212,0.2)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        }}
      >
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.6), transparent)',
            filter: 'blur(60px)',
          }}
        />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(6,182,212,0.15)',
                border: '1px solid rgba(6,182,212,0.25)',
              }}
            >
              <Briefcase size={22} className="text-cyan-300" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Client Panel
              </p>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-0.5">
                Contract Management
              </h1>
            </div>
          </div>
          <p className="text-slate-400 text-base max-w-2xl leading-relaxed mt-2">
            Track milestones, review submitted work, manage payments, and maintain clear
            communication with your hired freelancers.
          </p>
          {/* Inline stat pills */}
          <div className="flex flex-wrap gap-3 mt-5">
            {[
              {
                label: `${activeContracts} Active`,
                color: '#22d3ee',
                bg: 'rgba(6,182,212,0.12)',
                border: 'rgba(6,182,212,0.25)',
              },
              {
                label: `${submittedContracts} Awaiting Review`,
                color: '#fbbf24',
                bg: 'rgba(251,191,36,0.12)',
                border: 'rgba(251,191,36,0.25)',
              },
              {
                label: `${completedContracts} Completed`,
                color: '#34d399',
                bg: 'rgba(52,211,153,0.12)',
                border: 'rgba(52,211,153,0.25)',
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
        </div>
      </motion.div>

      {/* ── METRIC CARDS ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="stat-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: m.bg, border: `1px solid ${m.border}` }}
                >
                  <Icon size={18} style={{ color: m.color }} />
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                {m.title}
              </p>
              <p className="text-3xl font-black" style={{ color: m.color }}>
                {m.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* ── FILTERS ── */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div
            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
          >
            <Search size={16} className="text-slate-500 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project title or freelancer name..."
              className="bg-transparent outline-none flex-1 text-slate-200 placeholder-slate-600 text-sm"
            />
          </div>
          {/* Sort */}
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <SlidersHorizontal size={14} className="text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm text-slate-200 outline-none cursor-pointer"
            >
              <option value="newest" className="bg-[#0c1428]">
                Newest First
              </option>
              <option value="oldest" className="bg-[#0c1428]">
                Oldest First
              </option>
              <option value="budget" className="bg-[#0c1428]">
                Highest Budget
              </option>
            </select>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200"
              style={
                activeTab === tab
                  ? {
                      background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                      color: '#fff',
                      boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#64748b',
                    }
              }
            >
              {tab === 'all' ? `All (${contracts.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTRACTS LIST ── */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
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
            className="w-20 h-20 rounded-[36px] flex items-center justify-center mb-5 text-4xl"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            📂
          </div>
          <h3 className="text-xl font-bold text-slate-200">No Contracts Found</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-xs">
            No contracts match the current filter criteria.
          </p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((contract, ci) => {
            const leftBorderColor = STATUS_LEFT_BORDER[contract.status] || 'rgba(148,163,184,0.4)';
            return (
              <motion.div
                key={contract._id}
                custom={ci}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="relative rounded-[24px] overflow-hidden transition-all duration-300 group"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                }}
              >
                {/* Status color left bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]"
                  style={{ background: leftBorderColor }}
                />

                <div className="p-7 pl-8 space-y-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
                      >
                        {getInitials(contract.freelancer?.fullName)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-100 text-sm truncate max-w-[200px]">
                          {contract.gig?.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          with{' '}
                          <span className="text-slate-300 font-semibold">
                            {contract.freelancer?.fullName}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={STATUS_CHIP[contract.status] || 'chip chip-slate'}>
                        {contract.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-semibold">Work Progress</span>
                      <span
                        className="font-bold"
                        style={{ color: contract.status === 'completed' ? '#34d399' : '#a78bfa' }}
                      >
                        {contract.progress || 0}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${contract.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1">
                        Budget
                      </p>
                      <p className="text-sm font-black text-cyan-300">
                        ${contract.agreedBudget?.toLocaleString()}
                      </p>
                    </div>
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1">
                        Timeline
                      </p>
                      <p className="text-sm font-bold text-slate-200">{contract.deliveryTime}d</p>
                    </div>
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1">
                        Work
                      </p>
                      <p
                        className={`text-sm font-bold ${contract.workSubmitted ? 'text-emerald-400' : 'text-slate-500'}`}
                      >
                        {contract.workSubmitted ? '✓ Ready' : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                    <Calendar size={9} />
                    {new Date(contract.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    {contract.status === 'submitted' && (
                      <button
                        onClick={() => handleApprove(contract._id)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #059669, #34d399)',
                          color: '#fff',
                          boxShadow: '0 6px 24px rgba(52,211,153,0.25)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <CheckCheck size={14} />
                        {actionLoading ? 'Approving...' : 'Approve Work'}
                      </button>
                    )}
                    <Link
                      to={`/client/contract/${contract._id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#cbd5e1',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(124,58,237,0.12)';
                        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)';
                        e.currentTarget.style.color = '#a78bfa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = '#cbd5e1';
                      }}
                    >
                      View Details <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── AI INSIGHTS ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="rounded-[28px] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.05))',
          border: '1px solid rgba(124,58,237,0.2)',
        }}
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.2)' }}
            >
              <Sparkles size={18} className="text-violet-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Contract Insights</h3>
              <p className="text-slate-400 text-xs">
                Performance recommendations for your contracts
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Spending Optimization',
                text: 'Active contracts generate the highest ROI. Group related features to reduce total design cost.',
              },
              {
                label: 'Delivery Confidence',
                text: 'Shorter milestone check-ins improve freelancer response latency and retention.',
              },
              {
                label: 'Contract Success',
                text: 'High-budget contracts with complete descriptions show a 94% positive completion rate.',
              },
            ].map((insight, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl space-y-3"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(124,58,237,0.15)' }}
                >
                  <Target size={14} className="text-violet-300" />
                </div>
                <h4 className="font-bold text-xs text-slate-200">{insight.label}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
