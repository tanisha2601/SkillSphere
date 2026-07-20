import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getContractById, clearSelectedContract, releaseMilestonePayment, fetchProgressLog } from '../../store/slices/contractSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Briefcase, User, Users, DollarSign, Clock,
  CheckCircle, Calendar, CreditCard, Star, Tag, Shield,
  BookOpen, BarChart2, ListTodo, ChevronDown, ChevronUp,
} from 'lucide-react';

/* ── Token maps ── */
const STATUS_CHIP = {
  active:       'chip chip-cyan',
  submitted:    'chip chip-amber',
  completed:    'chip chip-emerald',
  cancelled:    'chip chip-rose',
  'in-progress':'chip chip-violet',
};

const STATUS_GLOW = {
  active:       'rgba(6,182,212,0.2)',
  submitted:    'rgba(251,191,36,0.2)',
  completed:    'rgba(52,211,153,0.2)',
  cancelled:    'rgba(251,113,133,0.15)',
  'in-progress':'rgba(124,58,237,0.2)',
};

const TIMELINE_EVENTS = [
  { key:'createdAt',   label:'Contract Created',  icon:BookOpen,    color:'#a78bfa', bg:'rgba(124,58,237,0.15)' },
  { key:'submittedAt', label:'Work Submitted',    icon:BarChart2,   color:'#fbbf24', bg:'rgba(251,191,36,0.15)' },
  { key:'approvedAt',  label:'Work Approved',     icon:CheckCircle, color:'#34d399', bg:'rgba(52,211,153,0.15)' },
];

const fadeUp = {
  hidden:  { opacity:0, y:18 },
  visible: (i=0) => ({ opacity:1, y:0, transition:{ duration:0.45, delay:i*0.07, ease:[0.4,0,0.2,1] } }),
};

function getInitials(name='') {
  return name?.split(' ').filter(Boolean).slice(0,2).map(n=>n[0]?.toUpperCase()).join('')||'?';
}

/* ── Skeleton ── */
function SkeletonDetail() {
  return (
    <div className="space-y-6">
      <div className="shimmer rounded-[32px] h-48" />
      <div className="grid md:grid-cols-2 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="shimmer rounded-[24px] h-40" />)}
      </div>
    </div>
  );
}

/* ── Main ── */
export default function ClientContractDetails() {
  const { id }      = useParams();
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const { selectedContract, detailLoading, error, progressLogs, actionLoading } = useSelector(s => s.contract);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    dispatch(getContractById(id));
    dispatch(fetchProgressLog(id));
    return () => dispatch(clearSelectedContract());
  }, [dispatch, id]);

  if (detailLoading) return <SkeletonDetail />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-[28px] text-center" style={{ background:'rgba(251,113,133,0.06)', border:'1px solid rgba(251,113,133,0.2)' }}>
        <div className="text-rose-400 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background:'rgba(251,113,133,0.12)' }}>
          <Shield size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-200 mb-2">Error Loading Contract</h3>
        <p className="text-sm text-slate-500 mb-5">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary text-sm">← Go Back</button>
      </div>
    );
  }

  if (!selectedContract) return null;
  const c = selectedContract;
  const glowColor = STATUS_GLOW[c.status] || 'rgba(148,163,184,0.15)';

  return (
    <div className="space-y-6 text-white">

      {/* ── Back button ── */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-200 transition-colors">
        <ArrowLeft size={15} /> Back to Contracts
      </button>

      {/* ── HERO HEADER ── */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55 }}
        className="relative overflow-hidden rounded-[32px] p-10"
        style={{
          background: `linear-gradient(135deg, ${glowColor} 0%, rgba(6,8,24,0.4) 100%)`,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: `0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)`,
        }}
      >
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.25)' }}>
                <Briefcase size={20} className="text-violet-300" />
              </div>
              <span className={STATUS_CHIP[c.status] || 'chip chip-slate'}>
                {c.status?.charAt(0).toUpperCase() + c.status?.slice(1)}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{c.gig?.title}</h1>
            <p className="text-xs text-slate-500 mt-2 font-mono">Contract ID: {c._id}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {c.status === 'completed' && (
              <Link to={`/client/contract/${c._id}/review`} className="btn-primary"
                style={{ background:'linear-gradient(135deg, #7C3AED, #a855f7)' }}>
                <Star size={14} /> Give Review
              </Link>
            )}
            {c.paymentStatus !== 'paid' && (
              <Link to={`/client/contract/${c._id}/pay`} className="btn-primary"
                style={{ background:'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                <CreditCard size={14} /> Fund Contract
              </Link>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 mt-6">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-400 font-semibold">Work Progress</span>
            <span className="font-bold text-violet-300">{c.progress||0}%</span>
          </div>
          <div className="progress-bar h-2">
            <div className="progress-fill" style={{ width:`${c.progress||0}%` }} />
          </div>
        </div>
      </motion.div>

      {/* ── PARTIES + FINANCIALS ── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Parties card */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
          className="rounded-[24px] p-7" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Users size={15} className="text-violet-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contract Parties</h3>
          </div>
          <div className="space-y-4">
            {[
              { name:c.client?.fullName,     email:c.client?.email,     role:'Client',     grad:'from-violet-500 to-indigo-600' },
              { name:c.freelancer?.fullName, email:c.freelancer?.email, role:'Freelancer', grad:'from-cyan-500 to-blue-600' },
            ].map(party => (
              <div key={party.role} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white bg-gradient-to-br ${party.grad}`}>
                  {getInitials(party.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-200">{party.name}</p>
                  <p className="text-xs text-slate-500 truncate">{party.email}</p>
                </div>
                <span className="chip chip-slate">{party.role}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Financial details */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}
          className="rounded-[24px] p-7" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-5">
            <DollarSign size={15} className="text-emerald-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contract Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl" style={{ background:'rgba(52,211,153,0.07)', border:'1px solid rgba(52,211,153,0.15)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Agreed Budget</p>
              <p className="text-2xl font-black text-emerald-300">${c.agreedBudget?.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background:'rgba(124,58,237,0.07)', border:'1px solid rgba(124,58,237,0.15)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Delivery Time</p>
              <p className="text-2xl font-black text-violet-300">{c.deliveryTime} <span className="text-base font-medium text-slate-400">days</span></p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Work Submitted</p>
              <div className="flex items-center gap-1.5">
                {c.workSubmitted
                  ? <><CheckCircle size={15} className="text-emerald-400" /><span className="text-sm font-bold text-emerald-300">Submitted</span></>
                  : <><Clock size={15} className="text-slate-500" /><span className="text-sm font-bold text-slate-500">Pending</span></>}
              </div>
            </div>
            <div className="p-4 rounded-2xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Client Approved</p>
              <div className="flex items-center gap-1.5">
                {c.clientApproved
                  ? <><CheckCircle size={15} className="text-emerald-400" /><span className="text-sm font-bold text-emerald-300">Approved</span></>
                  : <><Clock size={15} className="text-slate-500" /><span className="text-sm font-bold text-slate-500">Pending</span></>}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── PROPOSAL DETAILS ── */}
      {c.proposal && (
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}
          className="rounded-[24px] p-7" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={15} className="text-cyan-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Original Proposal</h3>
          </div>
          <div className="p-5 rounded-2xl mb-4" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm text-slate-300 leading-relaxed">{c.proposal?.coverLetter}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-3 rounded-2xl flex items-center gap-2" style={{ background:'rgba(6,182,212,0.08)', border:'1px solid rgba(6,182,212,0.15)' }}>
              <DollarSign size={13} className="text-cyan-300" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Proposed Budget</p>
                <p className="text-sm font-black text-cyan-300">${c.proposal?.proposedBudget?.toLocaleString()}</p>
              </div>
            </div>
            <div className="px-4 py-3 rounded-2xl flex items-center gap-2" style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.15)' }}>
              <Clock size={13} className="text-amber-300" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Proposed Delivery</p>
                <p className="text-sm font-black text-amber-300">{c.proposal?.deliveryTime} days</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── MILESTONES (client view) ── */}
      {c.milestones?.length > 0 && (
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
          className="rounded-[24px] p-7" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-5">
            <ListTodo size={15} className="text-cyan-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Milestones</h3>
            <span className="text-xs text-slate-600 ml-1">{c.milestones.filter(m=>m.completed).length}/{c.milestones.length} done</span>
          </div>
          <div className="space-y-3">
            {c.milestones.map((m, i) => (
              <div key={m._id || i}
                className={`flex items-center justify-between p-4 rounded-2xl border ${m.completed ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-white/[0.02] border-white/8'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${m.completed ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400' : 'border-white/20 text-slate-600'}`}>
                    {m.completed ? <CheckCircle size={14} /> : <span className="text-xs">{i+1}</span>}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${m.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{m.title}</p>
                    {m.completedAt && <p className="text-xs text-slate-600">{new Date(m.completedAt).toLocaleDateString()}</p>}
                    {m.dueDate && !m.completed && <p className="text-xs text-slate-600">Due: {new Date(m.dueDate).toLocaleDateString()}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {m.amount > 0 && (
                    <span className="text-xs font-mono text-emerald-300">${m.amount.toLocaleString()}</span>
                  )}
                  {m.completed && !m.paymentReleased && (
                    <button
                      onClick={() => dispatch(releaseMilestonePayment({ contractId: c._id, mId: m._id }))}
                      disabled={actionLoading}
                      className="text-xs px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors disabled:opacity-50">
                      Release payment
                    </button>
                  )}
                  {m.paymentReleased && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle size={12} /> Paid
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── PROGRESS LOGS (client read-only) ── */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}
        className="rounded-[24px] p-7" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => setShowLogs(v => !v)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 size={15} className="text-violet-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Freelancer Updates</h3>
          </div>
          {showLogs ? <ChevronUp size={15} className="text-slate-600" /> : <ChevronDown size={15} className="text-slate-600" />}
        </button>
        <AnimatePresence>
          {showLogs && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="overflow-hidden mt-4">
              {progressLogs.length > 0 ? (
                <div className="relative pl-5">
                  <div className="absolute left-[5px] top-0 bottom-0 w-px bg-white/10" />
                  <div className="space-y-4">
                    {progressLogs.map((log, i) => (
                      <div key={i} className="relative">
                        <span className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-violet-400" />
                        <div className="flex items-baseline gap-2">
                          <p className="text-sm text-slate-300">{log.note}</p>
                          {log.progress !== undefined && <span className="text-xs text-cyan-300 font-mono">{log.progress}%</span>}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No updates posted yet.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── TIMELINE ── */}
      <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
        className="rounded-[24px] p-7" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-7">
          <Calendar size={15} className="text-violet-300" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contract Timeline</h3>
        </div>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background:'linear-gradient(to bottom, rgba(124,58,237,0.4), transparent)' }} />
          <div className="space-y-7">
            {TIMELINE_EVENTS.map(event => {
              if (!c[event.key]) return null;
              const Icon = event.icon;
              return (
                <div key={event.key} className="flex items-start gap-5 relative">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                    style={{ background:event.bg, border:`1px solid ${event.color}40`, color:event.color }}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 pt-1.5">
                    <p className="text-sm font-bold text-slate-200">{event.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(c[event.key]).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

    </div>
  );
}
