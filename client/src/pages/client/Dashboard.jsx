import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getClientContracts, clearContractError } from '../../store/slices/contractSlice';
import { getAllGigs, clearGigError } from '../../store/slices/gigSlice';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import {
  Briefcase, FolderKanban, Zap, CheckCircle2, Handshake, Wallet,
  Plus, MessageSquare, FileText, TrendingUp, TrendingDown, Sparkles,
  Target, ArrowRight, Inbox, Calendar, Send, DollarSign, Rocket,
  FolderOpen, Activity, Clock, BarChart2,
} from 'lucide-react';

/* ── Tokens ── */
const PIE_COLORS = ['#7C3AED', '#06B6D4', '#34D399', '#F59E0B'];

const STATUS_STYLES = {
  open:        'chip chip-cyan',
  'in-progress': 'chip chip-amber',
  completed:   'chip chip-emerald',
  cancelled:   'chip chip-slate',
  active:      'chip chip-violet',
  submitted:   'chip chip-amber',
};

const CHART_TOOLTIP = {
  backgroundColor: 'rgba(6,8,24,0.97)',
  border: '1px solid rgba(124,58,237,0.25)',
  borderRadius: '16px',
  color: '#e2e8f0',
  fontSize: '12px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
};

function statusClass(status) {
  return STATUS_STYLES[status] || 'chip chip-slate';
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]?.toUpperCase()).join('') || '?';
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Working late';
}

/* ── Animations ── */
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.07, ease: [0.4,0,0.2,1] } }),
};

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

/* ── Sub-components ── */
function TrendBadge({ value }) {
  if (value == null) return null;
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${up ? 'bg-emerald-400/10 text-emerald-300' : 'bg-red-400/10 text-red-300'}`}>
      <Icon size={10} />{Math.abs(value)}%
    </span>
  );
}

function StatCard({ label, value, icon: Icon, accentClass, accentBg, trend, index }) {
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={fadeUp}
      className="stat-card flex flex-col justify-between min-h-[168px]"
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center ${accentClass}`}
          style={{ background: accentBg }}
        >
          <Icon size={20} />
        </div>
        <TrendBadge value={trend} />
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
        <p className="text-3xl font-black text-white">{value}</p>
      </div>
    </motion.div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="shimmer rounded-[24px] h-[168px]" />
  );
}
function SkeletonBlock({ className = '' }) {
  return <div className={`shimmer rounded-[24px] ${className}`} />;
}

function QuickAction({ to, icon: Icon, label, primary }) {
  return (
    <Link to={to} className={primary ? 'btn-primary' : 'btn-secondary'}>
      <Icon size={15} />{label}
    </Link>
  );
}

/* ── Main ── */
export default function ClientDashboard() {
  const dispatch = useDispatch();
  const { contracts, loading: contractLoading } = useSelector(s => s.contract);
  const { gigs, loading: gigLoading } = useSelector(s => s.gig);
  const { user } = useSelector(s => s.auth);

  useEffect(() => {
    dispatch(getClientContracts());
    // NOTE: the backend /api/gigs endpoint does not support a `client` filter
    // param — it silently ignores it and defaults to status: "open" only.
    // We fetch the public list and filter to this client's own gigs below.
    dispatch(getAllGigs());
    return () => { dispatch(clearContractError()); dispatch(clearGigError()); };
  }, [dispatch]);

  const loading = contractLoading || gigLoading;

  /* Scope data to the logged-in client only — the API returns the public
     gig list, so ownership filtering has to happen here. Also guards
     against gigs/contracts ever coming back as something other than an
     array (e.g. an error payload) so .filter/.map never crash. */
  const myGigs = useMemo(() => {
    if (!Array.isArray(gigs)) return [];
    return gigs.filter(g => g.client?._id === user?._id || g.client === user?._id);
  }, [gigs, user]);

  const safeContracts = Array.isArray(contracts) ? contracts : [];

  /* Stats */
  const totalProjects     = myGigs.length;
  const openProjects      = myGigs.filter(g => g.status === 'open').length;
  const inProgress        = myGigs.filter(g => g.status === 'in-progress').length;
  const completedProjects = myGigs.filter(g => g.status === 'completed').length;
  const totalContracts    = safeContracts.length;
  const activeContracts   = safeContracts.filter(c => c.status === 'active').length;
  const submittedContracts= safeContracts.filter(c => c.status === 'submitted').length;
  const completedContracts= safeContracts.filter(c => c.status === 'completed').length;
  const totalSpent        = safeContracts.filter(c => c.status === 'completed').reduce((s, c) => s + (c.agreedBudget || 0), 0);

  /* Trends */
  const now = new Date();
  const monthKey = d => `${new Date(d).getFullYear()}-${new Date(d).getMonth()}`;
  const thisKey = monthKey(now);
  const lastKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const growthPct = (t, l) => !l ? (t > 0 ? 100 : null) : Math.round(((t - l) / l) * 100);

  const gigsThisMonth  = myGigs.filter(g => monthKey(g.createdAt) === thisKey).length;
  const gigsLastMonth  = myGigs.filter(g => monthKey(g.createdAt) === lastKey).length;
  const projectsTrend  = growthPct(gigsThisMonth, gigsLastMonth);
  const spendThisMonth = safeContracts.filter(c => c.status === 'completed' && monthKey(c.createdAt) === thisKey).reduce((s,c) => s+(c.agreedBudget||0), 0);
  const spendLastMonth = safeContracts.filter(c => c.status === 'completed' && monthKey(c.createdAt) === lastKey).reduce((s,c) => s+(c.agreedBudget||0), 0);
  const spendTrend     = growthPct(spendThisMonth, spendLastMonth);

  const stats = [
    { label: 'Total Projects',    value: totalProjects,                  icon: FolderKanban, accentClass: 'text-violet-300',  accentBg: 'rgba(124,58,237,0.15)',  trend: projectsTrend },
    { label: 'Open Projects',     value: openProjects,                   icon: Inbox,        accentClass: 'text-sky-300',     accentBg: 'rgba(56,189,248,0.12)',   trend: null },
    { label: 'In Progress',       value: inProgress,                     icon: Zap,          accentClass: 'text-amber-300',   accentBg: 'rgba(251,191,36,0.12)',   trend: null },
    { label: 'Completed',         value: completedProjects,              icon: CheckCircle2, accentClass: 'text-emerald-300', accentBg: 'rgba(52,211,153,0.12)',   trend: null },
    { label: 'Active Contracts',  value: activeContracts,                icon: Handshake,    accentClass: 'text-cyan-300',    accentBg: 'rgba(6,182,212,0.12)',    trend: null },
    { label: 'Total Spending',    value: `$${totalSpent.toLocaleString()}`, icon: Wallet,    accentClass: 'text-fuchsia-300', accentBg: 'rgba(192,38,211,0.12)',   trend: spendTrend },
  ];

  /* Charts */
  const projectStatusData   = [{ name:'Open', value:openProjects }, { name:'In Progress', value:inProgress }, { name:'Completed', value:completedProjects }, { name:'Cancelled', value:myGigs.filter(g=>g.status==='cancelled').length }].filter(d=>d.value>0);
  const contractStatusData  = [{ name:'Active', value:activeContracts }, { name:'Submitted', value:submittedContracts }, { name:'Completed', value:completedContracts }, { name:'Cancelled', value:safeContracts.filter(c=>c.status==='cancelled').length }].filter(d=>d.value>0);

  const monthlyHiring = (() => {
    const m = {};
    safeContracts.forEach(c => { const mo = new Date(c.createdAt).toLocaleDateString('en-US',{month:'short',year:'2-digit'}); m[mo]=(m[mo]||0)+1; });
    return Object.entries(m).map(([month,count])=>({month,count})).slice(-6);
  })();

  const spendingTrend = (() => {
    const m = {};
    safeContracts.filter(c=>c.status==='completed').forEach(c => { const mo = new Date(c.createdAt).toLocaleDateString('en-US',{month:'short',year:'2-digit'}); m[mo]=(m[mo]||0)+(c.agreedBudget||0); });
    return Object.entries(m).map(([month,spend])=>({month,spend})).slice(-6);
  })();

  /* AI Insights */
  const aiInsights = useMemo(() => {
    const insights = [];
    const categoryStats = {};
    myGigs.forEach(g => {
      const cat = g.category || 'Uncategorized';
      const pc = g.proposalsCount ?? g.proposals?.length ?? 0;
      if (!categoryStats[cat]) categoryStats[cat] = { total: 0, count: 0 };
      categoryStats[cat].total += pc; categoryStats[cat].count += 1;
    });
    const catAvgs = Object.entries(categoryStats).map(([cat,s]) => ({ cat, avg: s.total/s.count }));
    if (catAvgs.length > 1) {
      const sorted = [...catAvgs].sort((a,b) => b.avg-a.avg);
      const top = sorted[0];
      const overall = catAvgs.reduce((s,c)=>s+c.avg,0)/catAvgs.length;
      if (top.avg > 0 && overall > 0) {
        const diff = Math.round(((top.avg-overall)/overall)*100);
        if (diff > 0) insights.push(`"${top.cat}" projects receive ${diff}% more proposals than average.`);
      }
    }
    if (spendTrend !== null) insights.push(spendTrend >= 0 ? `Spending is up ${spendTrend}% this month vs last.` : `Spending is down ${Math.abs(spendTrend)}% this month vs last.`);
    else insights.push('Post more projects and complete contracts to unlock spending trend insights.');
    if (totalContracts > 0) {
      const rate = Math.round((completedContracts/totalContracts)*100);
      insights.push(`${rate}% of your contracts completed — ${rate >= 70 ? 'excellent track record!' : 'monitor stalled contracts.'}`);
    }
    insights.push('Freelancers who get clear briefs deliver 40% faster — prioritize detailed descriptions.');
    return insights;
  }, [myGigs, spendTrend, totalContracts, completedContracts]);

  /* Lists */
  const latestProjects  = [...myGigs].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
  const recentContracts = [...safeContracts].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);

  const timelineEvents = [
    ...myGigs.map(g => ({ type:'project', label:`Posted "${g.title}"`, date:g.createdAt })),
    ...safeContracts.map(c => ({ type:'contract', label:`Contract with ${c.freelancer?.fullName||'a freelancer'}`, date:c.createdAt })),
    ...safeContracts.filter(c=>c.status==='completed').map(c => ({ type:'payment', label:`Payment complete — "${c.gig?.title||'project'}"`, date:c.updatedAt||c.createdAt })),
    ...myGigs.filter(g=>g.status==='completed').map(g => ({ type:'completed', label:`"${g.title}" marked completed`, date:g.updatedAt||g.createdAt })),
  ].filter(e=>e.date).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6);

  const timelineIcon = type => type==='project'?Rocket:type==='contract'?Handshake:type==='payment'?Wallet:CheckCircle2;
  const timelineColor = type => type==='project'?'rgba(124,58,237,0.2)':type==='contract'?'rgba(6,182,212,0.2)':type==='payment'?'rgba(52,211,153,0.2)':'rgba(251,191,36,0.2)';
  const timelineTextColor = type => type==='project'?'#a78bfa':type==='contract'?'#22d3ee':type==='payment'?'#34d399':'#fbbf24';

  return (
    <div className="space-y-8 text-white">

      {/* ── HERO ── */}
      <motion.div
        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:[0.4,0,0.2,1] }}
        className="relative overflow-hidden rounded-[32px] p-8 md:p-10"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(6,182,212,0.08) 100%)',
          border: '1px solid rgba(124,58,237,0.2)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* BG decorations */}
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full opacity-30" style={{ background:'radial-gradient(circle, rgba(124,58,237,0.5), transparent)', filter:'blur(60px)' }} />
        <div className="absolute -left-8 -bottom-8 w-48 h-48 rounded-full opacity-20" style={{ background:'radial-gradient(circle, rgba(6,182,212,0.5), transparent)', filter:'blur(50px)' }} />
        <div className="absolute inset-0 grid-bg opacity-40" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background:'rgba(124,58,237,0.2)', color:'#a78bfa', border:'1px solid rgba(124,58,237,0.3)' }}>
                {timeGreeting()}
              </span>
              {activeContracts > 0 && (
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background:'rgba(52,211,153,0.15)', color:'#34d399', border:'1px solid rgba(52,211,153,0.25)' }}>
                  {activeContracts} active
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
              Welcome back,{' '}
              <span className="gradient-text">{user?.fullName?.split(' ')[0] || 'Client'}</span> 👋
            </h1>
            <p className="text-slate-400 mt-3 text-base md:text-lg max-w-2xl leading-relaxed">
              You have <span className="text-white font-semibold">{openProjects} open {openProjects === 1 ? 'project' : 'projects'}</span> and{' '}
              <span className="text-white font-semibold">{activeContracts} active {activeContracts === 1 ? 'contract' : 'contracts'}</span> in motion.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <QuickAction to="/client/post-job"          icon={Plus}         label="Post a Job"       primary />
              <QuickAction to="/client/manage-gigs"       icon={FolderKanban} label="My Projects"                />
              <QuickAction to="/client/manage-contracts"  icon={Handshake}    label="Contracts"                  />
              <QuickAction to="/messages"                 icon={MessageSquare} label="Messages"                  />
            </div>
          </div>

          {/* Mini metrics */}
          <div className="flex flex-col gap-3 md:min-w-[180px]">
            {[
              { label: 'Projects', val: totalProjects,     color: '#a78bfa' },
              { label: 'Contracts', val: totalContracts,   color: '#22d3ee' },
              { label: 'Spent',    val: `$${totalSpent.toLocaleString()}`, color: '#34d399' },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between px-4 py-2.5 rounded-2xl" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-xs text-slate-400 font-semibold">{m.label}</span>
                <span className="text-sm font-black" style={{ color: m.color }}>{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── STAT GRID ── */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading
          ? [1,2,3,4,5,6].map(i => <SkeletonStatCard key={i} />)
          : stats.map((s,i) => <StatCard key={s.label} index={i} {...s} />)
        }
      </div>

      {/* ── AI INSIGHTS ── */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp}
        className="rounded-[28px] overflow-hidden"
        style={{ background:'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.05))', border:'1px solid rgba(124,58,237,0.2)' }}
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background:'rgba(124,58,237,0.2)' }}>
              <Sparkles size={18} className="text-violet-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Insights</h3>
              <p className="text-slate-400 text-xs">Data-driven observations from your workspace</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {aiInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl p-4 transition-all duration-300"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
              >
                <span className="w-7 h-7 flex-shrink-0 rounded-xl flex items-center justify-center" style={{ background:'rgba(124,58,237,0.15)' }}>
                  <Target size={13} className="text-violet-300" />
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── CHARTS ROW 1 ── */}
      <div className="grid md:grid-cols-2 gap-6">
        {[
          {
            title: 'Projects by Status',
            sub: 'Distribution across statuses',
            icon: BarChart2,
            content: loading ? <SkeletonBlock className="h-[280px]" /> :
              projectStatusData.length === 0 ? <EmptyChart text="No project data yet" /> :
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={projectStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:'#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize:11, fill:'#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill:'rgba(124,58,237,0.06)' }} />
                  <Bar dataKey="value" radius={[8,8,0,0]}>
                    {projectStatusData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          },
          {
            title: 'Contracts by Status',
            sub: 'Contract pipeline overview',
            icon: Activity,
            content: loading ? <SkeletonBlock className="h-[280px]" /> :
              contractStatusData.length === 0 ? <EmptyChart text="No contract data yet" /> :
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={contractStatusData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`} labelLine={false}
                  >
                    {contractStatusData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Legend wrapperStyle={{ fontSize:'11px', color:'#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
          },
        ].map((chart, ci) => {
          const Icon = chart.icon;
          return (
            <motion.div key={ci} initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp}
              className="glass-strong p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(124,58,237,0.12)' }}>
                  <Icon size={16} className="text-violet-300" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">{chart.title}</h3>
                  <p className="text-xs text-slate-500">{chart.sub}</p>
                </div>
              </div>
              {chart.content}
            </motion.div>
          );
        })}
      </div>

      {/* ── CHARTS ROW 2 ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp} className="glass-strong p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(6,182,212,0.12)' }}>
              <Briefcase size={16} className="text-cyan-300" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100">Monthly Hiring Activity</h3>
              <p className="text-xs text-slate-500">Contracts initiated per month</p>
            </div>
          </div>
          {monthlyHiring.length === 0 ? <EmptyChart text="No hiring activity yet" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyHiring}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize:11, fill:'#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize:11, fill:'#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill:'rgba(6,182,212,0.06)' }} />
                <Bar dataKey="count" fill="#06B6D4" radius={[6,6,0,0]} name="Contracts" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp} className="glass-strong p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(52,211,153,0.12)' }}>
              <TrendingUp size={16} className="text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100">Spending Trend</h3>
              <p className="text-xs text-slate-500">Monthly budget disbursed</p>
            </div>
          </div>
          {spendingTrend.length === 0 ? <EmptyChart text="No spending data yet" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={spendingTrend}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#34D399" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#34D399" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize:11, fill:'#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP} formatter={v => [`$${v.toLocaleString()}`, 'Spend']} />
                <Area type="monotone" dataKey="spend" stroke="#34D399" strokeWidth={2.5} fill="url(#spendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* ── PROJECTS + CONTRACTS ── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Latest Projects */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp}
          className="glass-strong p-8 flex flex-col h-auto min-h-[240px]"
        >
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div>
              <h3 className="font-bold text-slate-100">Latest Projects</h3>
              <p className="text-xs text-slate-500 mt-0.5">Recently posted jobs</p>
            </div>
            <Link to="/client/manage-gigs" className="text-xs font-semibold text-violet-300 hover:text-violet-200 transition flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {loading ? [1,2,3].map(i => <SkeletonBlock key={i} className="h-20" />) :
              latestProjects.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <FolderOpen size={36} className="text-slate-700 mb-3" />
                  <p className="text-sm text-slate-500 mb-4">No projects yet. Post your first job.</p>
                  <Link to="/client/post-job" className="btn-primary text-xs px-4 py-2">Post New Project</Link>
                </div>
              ) : latestProjects.map(gig => {
                const pc = gig.proposalsCount ?? gig.proposals?.length ?? 0;
                return (
                  <div key={gig._id}
                    className="flex items-start gap-3 p-4 rounded-2xl transition-all duration-200 group cursor-pointer"
                    style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(124,58,237,0.07)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-100 text-sm truncate">{gig.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="chip chip-slate">{gig.category || 'General'}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><Send size={9} /> {pc} proposal{pc===1?'':'s'}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><DollarSign size={9} />{gig.budget?.toLocaleString?.()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${statusClass(gig.status)}`}>{gig.status}</span>
                      <Link to={`/gig/${gig._id}`} className="text-[10px] font-semibold text-violet-300 opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
                        View <ArrowRight size={9} />
                      </Link>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </motion.div>

        {/* Recent Contracts */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp}
          className="glass-strong p-8 flex flex-col h-auto min-h-[240px]"
        >
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div>
              <h3 className="font-bold text-slate-100">Recent Contracts</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest freelancer engagements</p>
            </div>
            <Link to="/client/manage-contracts" className="text-xs font-semibold text-violet-300 hover:text-violet-200 transition flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {loading ? [1,2,3].map(i => <SkeletonBlock key={i} className="h-24" />) :
              recentContracts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <FileText size={36} className="text-slate-700 mb-3" />
                  <p className="text-sm text-slate-500">No contracts yet. Hire a freelancer.</p>
                </div>
              ) : recentContracts.map(contract => (
                <div key={contract._id} className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200"
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(6,182,212,0.06)'; e.currentTarget.style.borderColor='rgba(6,182,212,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background:'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
                    {initials(contract.freelancer?.fullName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-100 text-sm truncate">{contract.gig?.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{contract.freelancer?.fullName}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-cyan-300 font-bold">${contract.agreedBudget?.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500">{contract.progress || 0}% done</span>
                    </div>
                    <div className="progress-bar mt-1.5">
                      <div className="progress-fill" style={{ width:`${contract.progress||0}%` }} />
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${statusClass(contract.status)}`}>{contract.status}</span>
                </div>
              ))
            }
          </div>
        </motion.div>
      </div>

      {/* ── ACTIVITY TIMELINE ── */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp} className="glass-strong p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(251,191,36,0.12)' }}>
            <Clock size={16} className="text-amber-300" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100">Activity Timeline</h3>
            <p className="text-xs text-slate-500">Your recent workspace events</p>
          </div>
        </div>
        {timelineEvents.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No activity yet. Post a project to get started.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background:'linear-gradient(to bottom, rgba(124,58,237,0.3), transparent)' }} />
            <div className="space-y-6">
              {timelineEvents.map((event, i) => {
                const Icon = timelineIcon(event.type);
                const bg   = timelineColor(event.type);
                const col  = timelineTextColor(event.type);
                return (
                  <motion.div key={i} initial={{ opacity:0, x:-10 }} whileInView={{ opacity:1, x:0 }} transition={{ delay: i*0.06 }} viewport={{ once:true }}
                    className="flex items-start gap-5 relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                      style={{ background: bg, border:`1px solid ${col}40`, color: col }}>
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <p className="text-sm font-semibold text-slate-200">{event.label}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(event.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

    </div>
  );
}

function EmptyChart({ text }) {
  return (
    <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm">{text}</div>
  );
}