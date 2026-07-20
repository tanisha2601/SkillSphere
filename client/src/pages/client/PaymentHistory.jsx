import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getClientPaymentHistory } from '../../store/slices/paymentSlice';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Wallet, DollarSign, TrendingUp, ArrowDownToLine, AlertCircle,
  Activity, CheckCircle, CalendarDays, BarChart2, Layers,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const CHART_TOOLTIP = {
  backgroundColor: 'rgba(6,8,24,0.97)',
  border: '1px solid rgba(124,58,237,0.25)',
  borderRadius: '16px',
  color: '#e2e8f0',
  fontSize: '12px',
};

const fadeUp = {
  hidden:  { opacity:0, y:18 },
  visible: (i=0) => ({ opacity:1, y:0, transition:{ duration:0.45, delay:i*0.07, ease:[0.4,0,0.2,1] } }),
};

export default function PaymentHistory() {
  const dispatch = useDispatch();
  const { payments, loading, error } = useSelector(s => s.payment);

  useEffect(() => { dispatch(getClientPaymentHistory()); }, [dispatch]);

  const totalSpent  = useMemo(() => payments.reduce((s,p) => s+(p.amount||0), 0), [payments]);
  const spendMonth  = useMemo(() => {
    const now = new Date();
    return payments.filter(p => { const d=new Date(p.createdAt); return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); }).reduce((s,p)=>s+(p.amount||0),0);
  }, [payments]);
  const completedPayments  = useMemo(() => payments.filter(p=>p.status==='paid').length, [payments]);
  const avgContractValue   = useMemo(() => payments.length ? Math.round(totalSpent/payments.length) : 0, [payments, totalSpent]);

  const chartData = useMemo(() => {
    const months = {};
    payments.forEach(p => {
      const mo = new Date(p.createdAt).toLocaleDateString('en-US',{ month:'short', year:'2-digit' });
      if (!months[mo]) months[mo] = { month:mo, spend:0, transactions:0 };
      months[mo].spend       += p.amount||0;
      months[mo].transactions += 1;
    });
    return Object.values(months).reverse();
  }, [payments]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="shimmer rounded-[32px] h-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="shimmer rounded-[24px] h-36" />)}
        </div>
      </div>
    );
  }

  if (error) {
    const isAuth = error.toLowerCase().includes('token')||error.toLowerCase().includes('auth')||error.toLowerCase().includes('unauthorized')||error.toLowerCase().includes('401');
    return (
      <div className="flex flex-col items-center justify-center py-24 rounded-[28px] text-center" style={{ background:'rgba(251,113,133,0.06)', border:'1px solid rgba(251,113,133,0.2)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background:'rgba(251,113,133,0.12)' }}>
          <AlertCircle size={28} className="text-rose-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-200 mb-2">{isAuth ? 'Authentication Required' : 'Request Failed'}</h3>
        <p className="text-slate-500 text-sm max-w-xs">{isAuth ? 'Your session has expired. Please sign in again.' : error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">

      {/* ── HERO ── */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55 }}
        className="relative overflow-hidden rounded-[32px] p-10"
        style={{ background:'linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(124,58,237,0.07) 100%)', border:'1px solid rgba(52,211,153,0.18)', boxShadow:'0 24px 60px rgba(0,0,0,0.3)' }}
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20" style={{ background:'radial-gradient(circle, rgba(52,211,153,0.6), transparent)', filter:'blur(60px)' }} />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Financial Overview</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Payment Ledger</h1>
            <p className="text-slate-400 mt-2 text-base">Detailed record of all financial settlements, invoices, and project payments.</p>
          </div>
          {/* Focal balance */}
          <div className="flex-shrink-0 px-6 py-4 rounded-2xl" style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.2)' }}>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">Total Disbursed</p>
            <p className="text-4xl font-black text-emerald-300">${totalSpent.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* ── METRIC CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Spending',      value:`$${totalSpent.toLocaleString()}`,    icon:Wallet,       color:'#34d399', bg:'rgba(52,211,153,0.1)',   border:'rgba(52,211,153,0.2)' },
          { label:'This Month',          value:`$${spendMonth.toLocaleString()}`,    icon:CalendarDays, color:'#a78bfa', bg:'rgba(124,58,237,0.1)',   border:'rgba(124,58,237,0.2)' },
          { label:'Settlements',         value:completedPayments,                   icon:CheckCircle,  color:'#22d3ee', bg:'rgba(6,182,212,0.1)',    border:'rgba(6,182,212,0.2)' },
          { label:'Avg Project Value',   value:`$${avgContractValue.toLocaleString()}`,icon:Activity,  color:'#fbbf24', bg:'rgba(251,191,36,0.1)',   border:'rgba(251,191,36,0.2)' },
        ].map((m,i) => {
          const Icon = m.icon;
          return (
            <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={fadeUp} className="stat-card">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background:m.bg, border:`1px solid ${m.border}` }}>
                  <Icon size={18} style={{ color:m.color }} />
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{m.label}</p>
              <p className="text-2xl font-black" style={{ color:m.color }}>{m.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* ── CHARTS ── */}
      {payments.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp}
            className="rounded-[24px] p-8" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(52,211,153,0.12)' }}>
                <TrendingUp size={16} className="text-emerald-300" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Spending Volume</h3>
                <p className="text-xs text-slate-500">Monthly USD disbursed</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="spendGx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#34d399" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize:11, fill:'#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP} formatter={v=>[`$${v.toLocaleString()}`,'Spent']} />
                <Area type="monotone" dataKey="spend" stroke="#34d399" fill="url(#spendGx)" strokeWidth={2.5} name="Spent" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp}
            className="rounded-[24px] p-8" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(124,58,237,0.12)' }}>
                <BarChart2 size={16} className="text-violet-300" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Monthly Transactions</h3>
                <p className="text-xs text-slate-500">Payment count per month</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize:11, fill:'#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize:11, fill:'#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP} />
                <Bar dataKey="transactions" fill="#7C3AED" radius={[6,6,0,0]} name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* ── TRANSACTION TABLE ── */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp}
        className="rounded-[24px] overflow-hidden" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 px-8 py-6" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(52,211,153,0.12)' }}>
            <Layers size={16} className="text-emerald-300" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100">Transaction History</h3>
            <p className="text-xs text-slate-500">{payments.length} total records</p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="p-20 text-center">
            <div className="text-5xl mb-4">🧾</div>
            <h3 className="text-lg font-bold text-slate-400 mb-2">No transactions yet</h3>
            <p className="text-slate-600 text-sm">Your payment history will appear here once you complete a contract.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background:'rgba(255,255,255,0.02)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  {['Date','Project','Freelancer','Amount','Status','Invoice'].map(h => (
                    <th key={h} className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 ${h==='Invoice'?'text-right':''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, pi) => (
                  <tr key={p._id}
                    className="transition-all duration-150"
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString('en-IN',{ day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-200 truncate max-w-[180px]">{p.contract?.gig?.title||'System Payment'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-400 font-semibold">{p.contract?.freelancer?.fullName||'Platform Partner'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-base font-black text-emerald-300">${p.amount?.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`chip ${p.status==='paid'?'chip-emerald':p.status==='failed'?'chip-rose':'chip-amber'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toast.success('Invoice download initialized')}
                        className="w-8 h-8 rounded-xl flex items-center justify-center ml-auto transition-all text-slate-500"
                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}
                        onMouseEnter={e => { e.currentTarget.style.color='#22d3ee'; e.currentTarget.style.borderColor='rgba(6,182,212,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color='#475569'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
                        title="Download Invoice">
                        <ArrowDownToLine size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
