import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { getWalletData } from '../../store/slices/paymentSlice';
import {
  Wallet as WalletIcon,
  TrendingUp,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Clock,
  Receipt,
} from 'lucide-react';

import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Wallet() {
  const dispatch = useDispatch();
  const { walletBalance, totalEarnings, transactions, loading, error } = useSelector(
    (state) => state.payment
  );
  const { user } = useSelector((state) => state.auth);

  const now = new Date();
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const monthlyEarnings = safeTransactions
    .filter((t) => {
      const d = new Date(t?.createdAt);
      return (
        t?.type === 'credit' &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((total, t) => total + (t?.amount || 0), 0);

  const chartData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        earnings: 0,
      });
    }

    safeTransactions
      .filter((t) => t?.type === 'credit')
      .forEach((t) => {
        const d = new Date(t?.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const bucket = months.find((m) => m.key === key);
        if (bucket) bucket.earnings += t?.amount || 0;
      });

    return months.map(({ month, earnings }) => ({ month, earnings }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  useEffect(() => {
    dispatch(getWalletData());
  }, [dispatch]);

  /* ============================== LOADING SKELETON ============================== */
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Hero skeleton */}
        <div className="rounded-[36px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-8">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div className="space-y-4 w-full max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/10" />
                <div className="space-y-2">
                  <div className="h-6 w-48 rounded-lg bg-white/10" />
                  <div className="h-3 w-64 rounded-lg bg-white/5" />
                </div>
              </div>
              <div className="h-12 w-40 rounded-lg bg-white/10 mt-6" />
            </div>
            <div className="h-12 w-36 rounded-2xl bg-white/10 self-start" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-6 space-y-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/10" />
              <div className="h-3 w-20 rounded bg-white/5" />
              <div className="h-7 w-24 rounded bg-white/10" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="rounded-[36px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-8">
          <div className="h-6 w-48 rounded bg-white/10 mb-8" />
          <div className="h-[280px] rounded-2xl bg-white/[0.03]" />
        </div>

        {/* Table skeleton */}
        <div className="rounded-[36px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl overflow-hidden">
          <div className="p-8 border-b border-white/10 space-y-2">
            <div className="h-6 w-56 rounded bg-white/10" />
            <div className="h-3 w-40 rounded bg-white/5" />
          </div>
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-full rounded-xl bg-white/[0.03]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <div
        className="
        relative
        overflow-hidden
        rounded-[36px]
        border border-white/10
        bg-white/[0.04]
        backdrop-blur-3xl
        p-8 md:p-12
        "
      >
        {/* ambient background glows */}
        <div className="absolute w-[420px] h-[420px] rounded-full bg-cyan-500/20 blur-[150px] -top-32 -right-10" />
        <div className="absolute w-[280px] h-[280px] rounded-full bg-blue-600/20 blur-[130px] bottom-0 left-0" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          {/* left: icon + title + balance */}
          <div className="flex flex-col gap-8 w-full">
            {/* icon + title group */}
            <div className="flex items-center gap-4">
              <div
                className="
                w-14 h-14
                shrink-0
                rounded-2xl
                bg-gradient-to-br
                from-blue-500
                to-cyan-400
                flex items-center justify-center
                shadow-lg shadow-cyan-500/30
                ring-1 ring-white/20
                "
              >
                <WalletIcon className="text-white" size={24} strokeWidth={2.25} />
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Wallet &amp; Earnings
                </h2>
                <p className="text-slate-300 mt-1 text-sm md:text-[15px]">
                  Track your income and financial analytics.
                </p>
              </div>
            </div>

            {/* balance block */}
            <div className="relative pl-1">
              <p className="text-cyan-300/80 text-xs font-bold uppercase tracking-[0.2em]">
                Available Balance
              </p>

              <div className="relative mt-3 inline-block">
                {/* glow sitting behind the balance */}
                <div className="absolute inset-0 bg-cyan-400/30 blur-3xl scale-110 -z-10" />
                <h1 className="relative text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.25)]">
                  ${walletBalance?.toLocaleString() || 0}
                </h1>
              </div>
            </div>
          </div>

          {/* right: action button */}
          <button
            onClick={() => toast.success('Withdrawal request submitted! Funds will be transferred within 2-3 business days.')}
            className="
            w-full lg:w-auto
            shrink-0
            px-7 py-3.5
            rounded-2xl
            bg-gradient-to-r
            from-blue-600
            to-cyan-500
            font-semibold
            text-white
            shadow-lg shadow-cyan-500/20
            hover:scale-105
            hover:shadow-cyan-500/30
            active:scale-95
            transition-all
            duration-200
            flex items-center justify-center gap-2
            "
          >
            <ArrowUpRight size={18} />
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* ══════════════════════════ STATS ══════════════════════════ */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            label: 'This Month',
            value: `$${monthlyEarnings.toLocaleString()}`,
            icon: TrendingUp,
            color: '#22d3ee',
            bg: 'rgba(6,182,212,0.1)',
            border: 'rgba(6,182,212,0.2)',
          },
          {
            label: 'Lifetime Earnings',
            value: `$${totalEarnings?.toLocaleString() || 0}`,
            icon: DollarSign,
            color: '#34d399',
            bg: 'rgba(52,211,153,0.1)',
            border: 'rgba(52,211,153,0.2)',
          },
          {
            label: 'Transactions',
            value: safeTransactions.length,
            icon: CreditCard,
            color: '#60a5fa',
            bg: 'rgba(59,130,246,0.1)',
            border: 'rgba(59,130,246,0.2)',
          },
          {
            label: 'Pending',
            value: '$0',
            icon: Clock,
            color: '#a78bfa',
            bg: 'rgba(124,58,237,0.1)',
            border: 'rgba(124,58,237,0.2)',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="
              group
              rounded-[32px]
              border border-white/10
              bg-white/[0.04]
              backdrop-blur-3xl
              p-6
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-2xl
              hover:border-white/20
              "
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
              >
                <Icon size={19} style={{ color: stat.color }} />
              </div>

              <p className="text-slate-400 mt-5 text-xs font-bold uppercase tracking-widest">
                {stat.label}
              </p>
              <h3 className="text-3xl font-black mt-2" style={{ color: stat.color }}>
                {stat.value}
              </h3>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════ CHART ══════════════════════════ */}
      <div
        className="
        rounded-[36px]
        border border-white/10
        bg-white/[0.04]
        backdrop-blur-3xl
        p-6 md:p-8
        "
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20">
            <TrendingUp size={18} className="text-cyan-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100">Earnings Analytics</h3>
            <p className="text-xs text-slate-500">Last 6 months of credited earnings</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="earningsGx" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(6,8,24,0.97)',
                border: '1px solid rgba(6,182,212,0.25)',
                borderRadius: '16px',
                color: '#e2e8f0',
                fontSize: '12px',
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Earnings']}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#22d3ee"
              strokeWidth={2.5}
              fill="url(#earningsGx)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ══════════════════════════ AI INSIGHTS ══════════════════════════ */}
      <div
        className="
        relative
        overflow-hidden
        rounded-[32px]
        border border-cyan-500/20
        p-8
        "
        style={{
          background:
            'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(124,58,237,0.06) 100%)',
        }}
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20 blur-[70px] bg-cyan-400" />

        <div className="relative z-10 flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20">
            <Sparkles size={18} className="text-cyan-300" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-cyan-300">AI Insights</h3>
        </div>

        <div className="relative z-10 grid sm:grid-cols-3 gap-4">
          {[
            { icon: '📈', text: 'Your earnings increased compared to previous months.' },
            { icon: '🚀', text: 'Web Development projects generate the highest revenue.' },
            { icon: '⭐', text: 'Completing contracts faster may improve your earnings.' },
          ].map((insight, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-start gap-3"
            >
              <span className="text-xl leading-none">{insight.icon}</span>
              <p className="text-sm text-slate-300 leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════ TRANSACTIONS ══════════════════════════ */}
      <div
        className="
        rounded-[36px]
        border border-white/10
        bg-white/[0.04]
        backdrop-blur-3xl
        overflow-hidden
        "
      >
        <div className="flex items-center gap-3 px-6 md:px-8 py-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
            <Receipt size={18} className="text-emerald-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100">Transaction History</h3>
            <p className="text-xs text-slate-500">{safeTransactions.length} complete earnings record</p>
          </div>
        </div>

        {safeTransactions.length === 0 ? (
          <div className="p-16 md:p-20 text-center">
            <div
              className="
              w-20 h-20
              mx-auto
              mb-6
              rounded-3xl
              flex items-center justify-center
              bg-white/[0.03]
              border border-white/10
              text-4xl
              "
            >
              💳
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">No Transactions Yet</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Complete projects to start earning — your history will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }} className="border-b border-white/10">
                  <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Date
                  </th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Description
                  </th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Project
                  </th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {safeTransactions.map((tx, i) => (
                  <tr
                    key={tx?._id || i}
                    className="border-b border-white/5 hover:bg-white/[0.04] transition-colors duration-150"
                  >
                    <td className="p-5 text-sm text-slate-500 whitespace-nowrap">
                      {tx?.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '—'}
                    </td>

                    <td className="p-5 text-sm font-semibold text-slate-200">{tx?.description || '—'}</td>

                    <td className="p-5 text-sm text-slate-400">
                      {tx?.reference?.gig?.title || 'N/A'}
                    </td>

                    <td className="p-5 text-right">
                      <span
                        className={`inline-flex items-center font-bold text-sm ${
                          tx?.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx?.type === 'credit' ? (
                          <ArrowUpRight className="mr-1" size={16} />
                        ) : (
                          <ArrowDownRight className="mr-1" size={16} />
                        )}
                        {tx?.type === 'credit' ? '+' : '-'}${tx?.amount ?? 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}