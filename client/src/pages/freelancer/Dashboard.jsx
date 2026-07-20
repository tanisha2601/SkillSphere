import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getFreelancerContracts, clearContractError } from '../../store/slices/contractSlice';
import { getMyProposals, clearProposalError } from '../../store/slices/proposalSlice';
import { getRecommendedGigs } from '../../store/slices/gigSlice';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Star,
  Send,
  CheckCircle2,
  XCircle,
  Handshake,
  Rocket,
  Trophy,
  Wallet,
  Eye,
  FileText,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  Target,
  Zap,
  User as UserIcon,
  MapPin,
  Inbox,
  FolderOpen,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
const GLASS =
'bg-white/[0.04] backdrop-blur-3xl border border-white/10';
const GLASS_HOVER = 'hover:bg-white/[0.06] hover:border-white/20 transition-colors';

const PIE_COLORS = ['#22D3EE', '#34D399', '#F87171', '#94A3B8'];

const STATUS_STYLES = {
  pending: 'bg-amber-400/10 text-amber-300 border border-amber-400/20',
  accepted: 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20',
  rejected: 'bg-red-400/10 text-red-300 border border-red-400/20',
  withdrawn: 'bg-slate-400/10 text-slate-300 border border-slate-400/20',
  active: 'bg-sky-400/10 text-sky-300 border border-sky-400/20',
  'in-progress': 'bg-sky-400/10 text-sky-300 border border-sky-400/20',
  submitted: 'bg-amber-400/10 text-amber-300 border border-amber-400/20',
  completed: 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20',
};

function statusClass(status) {
  return STATUS_STYLES[status] || 'bg-slate-400/10 text-slate-300 border border-slate-400/20';
}

function initials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('') || '?'
  );
}

function daysRemaining(createdAt, deliveryTime) {
  if (!createdAt || !deliveryTime) return null;
  const start = new Date(createdAt);
  const due = new Date(start.getTime() + deliveryTime * 24 * 60 * 60 * 1000);
  const diff = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

/* ------------------------------------------------------------------ */
function StatCard({ label, value, icon: Icon, accent = 'text-cyan-300' }) {
  return (
    <div className={`${GLASS} ${GLASS_HOVER} rounded-2xl p-5 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-extrabold mt-2 text-white">{value}</p>
        </div>
        <span className={`p-2.5 rounded-xl bg-white/5 ${accent}`}>
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function SkeletonStatCard() {
  return (
    <div className="rounded-2xl p-5 bg-white/[0.03] border border-white/10 animate-pulse h-[92px]" />
  );
}

/* ------------------------------------------------------------------ */
function QuickStatChip({ icon: Icon, label }) {
  return (
    <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-sm text-slate-100 border border-white/10">
      <Icon size={14} className="text-cyan-300" />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
function CircularProgress({ percent }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" className="-rotate-90">
      <circle
        cx="55"
        cy="55"
        r={radius}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="10"
        fill="none"
      />
      <circle
        cx="55"
        cy="55"
        r={radius}
        stroke="url(#profileGradient)"
        strokeWidth="10"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#e2e8f0',
  fontSize: '12px',
};

/* ------------------------------------------------------------------ */
export default function FreelancerDashboard() {
  const dispatch = useDispatch();
  const { contracts, loading: contractLoading } = useSelector((state) => state.contract);
  const { proposals, loading: proposalLoading } = useSelector((state) => state.proposal);
  const { user } = useSelector((state) => state.auth);
  const { recommendedGigs } = useSelector((state) => state.gig);

  const activeContracts = contracts.filter(
    (c) => c.status === 'active' || c.status === 'in-progress'
  ).length;

  const profileFields = [
    user?.bio,
    user?.skills?.length,
    user?.github,
    user?.linkedin,
    user?.portfolio,
    user?.resumeUrl,
    user?.education,
    user?.location,
  ];

  const profileCompletion = profileFields.length
    ? Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100)
    : 0;

  const upcomingContracts = contracts
    .filter((c) => c.status === 'active' || c.status === 'in-progress')
    .slice(0, 5);

  const suggestedSkills = ['Redux', 'Docker', 'AWS', 'Next.js'];

  useEffect(() => {
    dispatch(getFreelancerContracts());
    dispatch(getMyProposals());
    dispatch(getRecommendedGigs());
    return () => {
      dispatch(clearContractError());
      dispatch(clearProposalError());
    };
  }, [dispatch]);

  const loading = contractLoading || proposalLoading;

  /* Stats */
  const appliedJobs = proposals.length;
  const acceptedProposals = proposals.filter((p) => p.status === 'accepted').length;
  const rejectedProposals = proposals.filter((p) => p.status === 'rejected').length;
  const totalContracts = contracts.length;
  const completedContracts = contracts.filter((c) => c.status === 'completed').length;
  const totalEarnings = contracts
    .filter((c) => c.status === 'completed')
    .reduce((sum, c) => sum + (c.agreedBudget || 0), 0);

  const proposalSuccessRate = appliedJobs ? Math.round((acceptedProposals / appliedJobs) * 100) : 0;

  const stats = [
    {
      label: 'Rating',
      value: `${user?.averageRating ? user.averageRating.toFixed(1) : '0.0'} (${user?.totalReviews || 0})`,
      icon: Star,
      accent: 'text-amber-300',
    },
    {
      label: 'Applications',
      value: appliedJobs,
      icon: Send,
      accent: 'text-indigo-300',
    },
    {
      label: 'Accepted',
      value: acceptedProposals,
      icon: CheckCircle2,
      accent: 'text-emerald-300',
    },
    {
      label: 'Rejected',
      value: rejectedProposals,
      icon: XCircle,
      accent: 'text-red-300',
    },
    {
      label: 'Contracts',
      value: totalContracts,
      icon: Handshake,
      accent: 'text-sky-300',
    },
    {
      label: 'Active Contracts',
      value: activeContracts,
      icon: Rocket,
      accent: 'text-cyan-300',
    },
    {
      label: 'Completed',
      value: completedContracts,
      icon: Trophy,
      accent: 'text-purple-300',
    },
    {
      label: 'Total Earnings',
      value: `$${totalEarnings.toLocaleString()}`,
      icon: Wallet,
      accent: 'text-amber-300',
    },
  ];

  /* Proposal status pie */
  const proposalData = [
    { name: 'Pending', value: proposals.filter((p) => p.status === 'pending').length },
    { name: 'Accepted', value: proposals.filter((p) => p.status === 'accepted').length },
    { name: 'Rejected', value: proposals.filter((p) => p.status === 'rejected').length },
    { name: 'Withdrawn', value: proposals.filter((p) => p.status === 'withdrawn').length },
  ].filter((d) => d.value > 0);

  /* Monthly activity bar chart – contracts grouped by month */
  const monthlyActivity = (() => {
    const months = {};
    contracts.forEach((c) => {
      const month = new Date(c.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months)
      .map(([month, count]) => ({ month, count }))
      .slice(-6);
  })();

  /* Recent contracts */
  const recentContracts = [...contracts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  /* Recent proposals */
  const recentProposals = [...proposals]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  /* Earnings analytics: this month vs last month (completed contracts) */
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${lastMonthDate.getMonth()}`;

  const completed = contracts.filter((c) => c.status === 'completed');
  const thisMonthEarnings = completed
    .filter((c) => {
      const d = new Date(c.createdAt);
      return `${d.getFullYear()}-${d.getMonth()}` === thisMonthKey;
    })
    .reduce((sum, c) => sum + (c.agreedBudget || 0), 0);
  const lastMonthEarnings = completed
    .filter((c) => {
      const d = new Date(c.createdAt);
      return `${d.getFullYear()}-${d.getMonth()}` === lastMonthKey;
    })
    .reduce((sum, c) => sum + (c.agreedBudget || 0), 0);

  const earningsGrowth = lastMonthEarnings
    ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100)
    : thisMonthEarnings > 0
      ? 100
      : 0;

  /* Activity timeline built from real events */
  const timelineEvents = [
    ...proposals.map((p) => ({
      type: 'proposal',
      label: `Applied to "${p.gig?.title || 'a gig'}"`,
      date: p.createdAt,
      status: p.status,
    })),
    ...contracts.map((c) => ({
      type: 'contract',
      label: `Contract started for "${c.gig?.title || 'a gig'}"`,
      date: c.createdAt,
      status: c.status,
    })),
    ...contracts
      .filter((c) => c.status === 'completed')
      .map((c) => ({
        type: 'payment',
        label: `Payment released for "${c.gig?.title || 'a gig'}"`,
        date: c.updatedAt || c.createdAt,
        status: 'completed',
      })),
  ]
    .filter((e) => e.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const timelineIcon = (type) => {
    if (type === 'proposal') return Send;
    if (type === 'contract') return Handshake;
    return Wallet;
  };

  /* AI insights - lightweight heuristics from the freelancer's own data */
  const aiInsights = [
    appliedJobs > 0
      ? `Your proposal success rate is ${proposalSuccessRate}% — ${
          proposalSuccessRate >= 50 ? 'well above average' : 'room to sharpen your pitch'
        }.`
      : 'Submit your first proposal to start seeing personalized insights.',
    'React and Node projects are currently seeing higher average budgets.',
    profileCompletion < 100
      ? `Completing your profile (${profileCompletion}% done) can boost visibility in recommendations.`
      : 'Your profile is fully optimized for recommendations.',
  ];

  return (
    <div className="min-h-screen bg-[#060818] text-white relative">
      {/* Background: grid + premium glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(56,189,248,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.07) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-10 left-10 w-[28rem] h-[28rem] bg-sky-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-[28rem] h-[28rem] bg-cyan-400/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="space-y-8 px-8 py-8">
        {/* Welcome Hero */}
        <div className="relative overflow-hidden rounded-[36px] p-8 bg-gradient-to-r from-[#0b1224] via-[#0e1a2e] to-[#020617] border border-white/10 shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl font-bold flex items-center gap-3">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Freelancer'}
              <span>👋</span>
            </h2>
            <p className="mt-3 text-slate-300 text-lg">
              Manage your projects, proposals and earnings from one place.
            </p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <QuickStatChip icon={Rocket} label={`${activeContracts} Active Projects`} />
              <QuickStatChip icon={Wallet} label={`$${totalEarnings.toLocaleString()} Earnings`} />
              <QuickStatChip icon={Star} label={`${user?.averageRating || '0.0'} Rating`} />
              <QuickStatChip icon={Target} label={`${proposalSuccessRate}% Proposal Success`} />
            </div>
          </div>
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl" />
        </div>

        {/* Profile Completion + Active Contracts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className={`${GLASS} rounded-[36px] p-6 shadow-xl flex items-center gap-6`}>
            <CircularProgress percent={profileCompletion} />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-100">Profile Completion</h3>
              <p className="text-3xl font-extrabold text-cyan-300 mt-1">{profileCompletion}%</p>
              <p className="text-xs text-slate-400 mt-2">
                Complete your profile to get better job recommendations.
              </p>
              <Link
                to="/freelancer/profile"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition"
              >
                Complete Profile <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className={`${GLASS} rounded-[36px] p-6 shadow-xl`}>
            <h3 className="font-semibold text-slate-100 mb-2">Active Contracts</h3>
            <p className="text-4xl font-extrabold text-cyan-300">{activeContracts}</p>
            <p className="text-sm text-slate-400 mt-2">Ongoing projects currently in progress.</p>
          </div>
        </div>

        {/* Availability row */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className={`${GLASS} p-5 rounded-2xl flex items-center gap-3`}>
            <span className="p-2.5 rounded-xl bg-emerald-400/10 text-emerald-300">
              <Zap size={18} />
            </span>
            <div>
              <h4 className="text-xs text-slate-400 uppercase tracking-wide">Availability</h4>
              <p className="text-lg font-bold text-emerald-300 mt-1">
                {user?.availability || 'Available'}
              </p>
            </div>
          </div>

          <div className={`${GLASS} p-5 rounded-2xl flex items-center gap-3`}>
            <span className="p-2.5 rounded-xl bg-sky-400/10 text-sky-300">
              <Eye size={18} />
            </span>
            <div>
              <h4 className="text-xs text-slate-400 uppercase tracking-wide">Profile Views</h4>
              <p className="text-lg font-bold text-white mt-1">{user?.profileViews || 0}</p>
            </div>
          </div>

          <div className={`${GLASS} p-5 rounded-2xl flex items-center gap-3`}>
            <span className="p-2.5 rounded-xl bg-indigo-400/10 text-indigo-300">
              <Send size={18} />
            </span>
            <div>
              <h4 className="text-xs text-slate-400 uppercase tracking-wide">Applications Sent</h4>
              <p className="text-lg font-bold text-white mt-1">
                {user?.applicationsSent || appliedJobs}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {loading
            ? [1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonStatCard key={i} />)
            : stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </div>

        {/* Earnings Analytics */}
        <div className={`${GLASS} rounded-2xl p-6 shadow-xl`}>
          <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-300" /> Earnings Analytics
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">This Month</p>
              <p className="text-2xl font-extrabold text-white mt-1">
                ${thisMonthEarnings.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Last Month</p>
              <p className="text-2xl font-extrabold text-white mt-1">
                ${lastMonthEarnings.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Growth</p>
              <p
                className={`text-2xl font-extrabold mt-1 flex items-center gap-1 ${
                  earningsGrowth >= 0 ? 'text-emerald-300' : 'text-red-300'
                }`}
              >
                {earningsGrowth >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                {earningsGrowth}%
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className={`${GLASS} rounded-2xl p-6 shadow-xl`}>
            <h3 className="font-semibold text-slate-100 mb-4">Proposal Status</h3>
            {proposalData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-300 text-sm">
                No proposals submitted yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={proposalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {proposalData.map((_, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={PIE_COLORS[idx % PIE_COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={`${GLASS} rounded-2xl p-6 shadow-xl`}>
            <h3 className="font-semibold text-slate-100 mb-4">Monthly Contract Activity</h3>
            {monthlyActivity.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-300 text-sm">
                No contract activity yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    cursor={{ fill: 'rgba(34,211,238,0.06)' }}
                  />
                  <Bar dataKey="count" fill="#22D3EE" radius={[4, 4, 0, 0]} name="Contracts" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Applications + Contracts */}
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <div className={`${GLASS} rounded-2xl p-6 shadow-xl h-auto min-h-[240px] flex flex-col`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-100">Recent Applications</h3>
              <Link to="/freelancer/my-proposals" className="text-xs text-cyan-300 hover:underline">
                View all
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-white/[0.03] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentProposals.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-sm">
                <Inbox className="mb-3 text-slate-600" size={32} />
                <p>No proposals yet.</p>
                <Link to="/freelancer/find-jobs" className="mt-3 text-cyan-300 hover:underline font-semibold">
                  Find jobs
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {recentProposals.map((proposal) => (
                  <div
                    key={proposal._id}
                    className="flex items-center justify-between py-3 px-3 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <div>
                      <p className="font-medium text-slate-100 text-sm">{proposal.gig?.title}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        ${proposal.proposedBudget?.toLocaleString()} · {proposal.deliveryTime}d ·{' '}
                        {proposal.createdAt
                          ? new Date(proposal.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : ''}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${statusClass(proposal.status)}`}
                    >
                      {proposal.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`${GLASS} rounded-2xl p-6 shadow-xl h-auto min-h-[240px] flex flex-col`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-100">Recent Contracts</h3>
              <Link to="/freelancer/my-contracts" className="text-xs text-cyan-300 hover:underline">
                View all
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-white/[0.03] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentContracts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-sm">
                <FileText className="mb-3 text-slate-600" size={32} />
                <p>No contracts yet.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {recentContracts.map((contract) => {
                  const remaining = daysRemaining(contract.createdAt, contract.deliveryTime);
                  return (
                    <div
                      key={contract._id}
                      className="flex items-center gap-3 py-3 px-3 rounded-xl bg-white/[0.03] border border-white/5"
                    >
                      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cyan-400/10 text-cyan-300 text-xs font-bold shrink-0">
                        {initials(contract.client?.fullName || contract.gig?.title)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-100 text-sm truncate">
                          {contract.gig?.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          ${contract.agreedBudget?.toLocaleString()}
                          {remaining !== null && remaining >= 0 ? ` · ${remaining}d left` : ''}
                          {' · '}
                          {contract.progress || 0}% done
                        </p>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-1.5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                            style={{ width: `${contract.progress || 0}%` }}
                          />
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${statusClass(contract.status)}`}
                      >
                        {contract.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className={`${GLASS} rounded-2xl p-6 shadow-xl`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-300" /> Recommended Jobs
            </h3>
            <Link to="/freelancer/find-jobs" className="text-xs text-cyan-300 hover:underline">
              Browse Jobs
            </Link>
          </div>

          {!recommendedGigs || recommendedGigs.length === 0 ? (
            <div className="text-center py-10 text-slate-300">
              <FolderOpen className="mx-auto mb-3 text-slate-600" size={32} />
              No recommendations available yet.
              <div className="mt-3">
                <Link
                  to="/freelancer/find-jobs"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-400/10 text-cyan-300 text-sm font-semibold hover:bg-cyan-400/20 transition"
                >
                  Browse Jobs <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {recommendedGigs.map((gig) => (
                <div
                  key={gig._id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition">
                        {gig.title}
                      </h4>
                      <p className="text-sm text-slate-400 mt-1.5 flex items-center gap-1">
                        <Wallet size={13} /> ${gig.budget}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-900 text-xs font-bold shadow-md shrink-0">
                      AI Match {gig.matchScore || 0}%
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(gig.skillsRequired || []).slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/gig/${gig._id}`}
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition"
                  >
                    View Details <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Projects */}
        <div className={`${GLASS} rounded-2xl p-6 shadow-xl`}>
          <h3 className="font-bold text-slate-100 mb-4">Upcoming Projects</h3>

          {upcomingContracts.length === 0 ? (
            <p className="text-slate-300 text-sm">No active projects right now.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {upcomingContracts.map((contract) => {
                const remaining = daysRemaining(contract.createdAt, contract.deliveryTime);
                const dueDate = contract.createdAt
                  ? new Date(
                      new Date(contract.createdAt).getTime() +
                        (contract.deliveryTime || 0) * 24 * 60 * 60 * 1000
                    )
                  : null;
                return (
                  <div
                    key={contract._id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-base font-bold text-slate-100">{contract.gig?.title}</h4>
                      {remaining !== null && (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                            remaining <= 2
                              ? 'bg-red-400/10 text-red-300 border border-red-400/20'
                              : 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/20'
                          }`}
                        >
                          {remaining >= 0 ? `${remaining}d left` : 'Overdue'}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-400 mt-2 flex items-center gap-1.5">
                      <UserIcon size={13} /> Client: {contract.client?.fullName || 'N/A'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1.5 flex items-center gap-1.5">
                      <Wallet size={13} /> Budget:
                      <span className="font-semibold text-emerald-300 ml-1">
                        ${contract.agreedBudget}
                      </span>
                    </p>
                    {dueDate && (
                      <p className="text-sm text-slate-400 mt-1.5 flex items-center gap-1.5">
                        <Clock size={13} /> Due{' '}
                        {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}

                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Progress</span>
                        <span>{contract.progress || 0}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                          style={{ width: `${contract.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link
                        to={`/gig/${contract.gig?._id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-slate-100 text-sm font-semibold hover:bg-cyan-400/20 hover:text-cyan-300 transition"
                      >
                        Update Progress <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className={`${GLASS} rounded-2xl p-6 shadow-xl`}>
          <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-cyan-300" /> AI Insights
          </h3>
          <div className="space-y-3">
            {aiInsights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/5 p-3.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 mt-2 shrink-0" />
                <p className="text-sm text-slate-300">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className={`${GLASS} rounded-2xl p-6 shadow-xl`}>
          <h3 className="font-bold text-slate-100 mb-4">Activity Timeline</h3>
          {timelineEvents.length === 0 ? (
            <p className="text-slate-300 text-sm">No activity yet.</p>
          ) : (
            <div className="space-y-0">
              {timelineEvents.map((event, i) => {
                const Icon = timelineIcon(event.type);
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-400/10 text-cyan-300 shrink-0">
                        <Icon size={14} />
                      </span>
                      {i < timelineEvents.length - 1 && (
                        <span className="w-px flex-1 bg-white/10 my-1" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm text-slate-100 font-medium">{event.label}</p>
                      <p className="text-xs text-slate-300 mt-1">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Suggested Skills */}
        <div className={`${GLASS} rounded-2xl p-6 shadow-xl`}>
          <h3 className="font-bold text-slate-100 mb-1">Suggested Skills</h3>
          <p className="text-xs text-slate-400 mb-4">Grow your roadmap with in-demand skills.</p>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-slate-200 font-medium text-sm hover:bg-cyan-400/10 hover:border-cyan-400/20 hover:text-cyan-300 transition-all duration-300"
              >
                <Zap size={13} /> Learn {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Professional Skills */}
        <div className={`${GLASS} rounded-2xl p-6 shadow-xl`}>
          <h3 className="font-bold text-slate-100 mb-4">Professional Skills</h3>
          <div className="flex flex-wrap gap-3">
            {user?.skills?.length > 0 ? (
              user.skills.map((skill, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-slate-200 font-medium text-sm hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {typeof skill === 'string' ? skill : skill.name}
                  {typeof skill === 'object' && skill.level && (
                    <span className="text-xs text-cyan-300">{skill.level}</span>
                  )}
                </span>
              ))
            ) : (
              <p className="text-slate-300 italic text-sm">No skills added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
