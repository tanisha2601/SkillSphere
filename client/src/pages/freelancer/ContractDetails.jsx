import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getContractById,
  submitWork,
  clearSelectedContract,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  completeMilestone,
  addProgressLog,
  fetchProgressLog,
  fetchDeadlineInfo,
} from '../../store/slices/contractSlice';
import {
  CheckCircle2, Clock, Plus, Pencil, Trash2, Check, X,
  Loader2, AlertTriangle, ChevronRight, ListTodo, FileText,
  Send, BarChart3, CalendarDays, DollarSign,
} from 'lucide-react';

/* ─── Status token maps ────────────────────────────────────── */
const STATUS_COLORS = {
  active:       'bg-blue-100 text-blue-700 border-blue-200',
  submitted:    'bg-amber-100 text-amber-700 border-amber-200',
  completed:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled:    'bg-red-100 text-red-700 border-red-200',
  'in-progress':'bg-indigo-100 text-indigo-700 border-indigo-200',
};

const TIMELINE_EVENTS = [
  { key: 'createdAt',   label: 'Contract Created', icon: '🔖' },
  { key: 'submittedAt', label: 'Work Submitted',   icon: '📤' },
  { key: 'approvedAt',  label: 'Work Approved',    icon: '✅' },
];

/* ─── Styles ────────────────────────────────────────────────── */
const card   = 'bg-white/[0.04] backdrop-blur-xl rounded-[36px] border border-white/10 shadow-xl p-6';
const inputCls = 'w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30 transition-colors placeholder:text-slate-600';

const emptyMilestone = { title: '', description: '', amount: '', dueDate: '' };

/* ─── Skeleton ──────────────────────────────────────────────── */
function SkeletonDetail() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white/[0.04] rounded-2xl border border-white/10 p-6">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i}>
              <div className="h-3 bg-white/10 rounded w-1/2 mb-2" />
              <div className="h-5 bg-white/10 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function FreelancerContractDetails() {
  const { id }       = useParams();
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const {
    selectedContract: c,
    detailLoading,
    actionLoading,
    progressLogs,
    deadlineInfo,
    error,
  } = useSelector(s => s.contract);

  /* ── Milestone form state ── */
  const [milestoneForm,    setMilestoneForm]    = useState(emptyMilestone);
  const [editingMId,       setEditingMId]       = useState(null);  // null = closed, 'new' = adding
  const [savingMilestone,  setSavingMilestone]  = useState(false);

  /* ── Progress log state ── */
  const [logNote,      setLogNote]      = useState('');
  const [logProgress,  setLogProgress]  = useState('');
  const [postingLog,   setPostingLog]   = useState(false);
  const [showLogs,     setShowLogs]     = useState(false);

  useEffect(() => {
    dispatch(getContractById(id));
    dispatch(fetchDeadlineInfo(id));
    dispatch(fetchProgressLog(id));
    return () => dispatch(clearSelectedContract());
  }, [dispatch, id]);

  const handleSubmitWork = () => {
    if (window.confirm('Submit your work? The client will be notified.')) {
      dispatch(submitWork(id));
    }
  };

  /* ── Milestone CRUD ── */
  const openAddMilestone = () => {
    setMilestoneForm(emptyMilestone);
    setEditingMId('new');
  };

  const openEditMilestone = (m) => {
    setMilestoneForm({
      title:       m.title || '',
      description: m.description || '',
      amount:      m.amount ?? '',
      dueDate:     m.dueDate ? m.dueDate.split('T')[0] : '',
    });
    setEditingMId(m._id);
  };

  const closeMilestoneForm = () => { setEditingMId(null); setMilestoneForm(emptyMilestone); };

  const saveMilestone = async () => {
    if (!milestoneForm.title?.trim()) return;
    setSavingMilestone(true);
    const data = {
      ...milestoneForm,
      amount:  milestoneForm.amount !== '' ? Number(milestoneForm.amount) : undefined,
      dueDate: milestoneForm.dueDate || undefined,
    };
    if (editingMId === 'new') {
      await dispatch(addMilestone({ contractId: id, data }));
    } else {
      await dispatch(updateMilestone({ contractId: id, mId: editingMId, data }));
    }
    setSavingMilestone(false);
    closeMilestoneForm();
  };

  const handleCompleteMilestone = async (mId) => {
    if (window.confirm('Mark this milestone as complete?')) {
      await dispatch(completeMilestone({ contractId: id, mId }));
    }
  };

  const handleDeleteMilestone = async (mId) => {
    if (window.confirm('Delete this milestone?')) {
      dispatch(deleteMilestone({ contractId: id, mId }));
    }
  };

  /* ── Progress log ── */
  const handleAddLog = async () => {
    if (!logNote.trim()) return;
    setPostingLog(true);
    await dispatch(addProgressLog({
      contractId: id,
      note: logNote.trim(),
      progress: logProgress !== '' ? Number(logProgress) : undefined,
    }));
    setLogNote('');
    setLogProgress('');
    setPostingLog(false);
  };

  /* ── Guards ── */
  if (detailLoading) return <SkeletonDetail />;
  if (error) return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-300">
      <p className="font-semibold">Error loading contract</p>
      <p className="text-sm mt-1">{error}</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-sm underline">← Go Back</button>
    </div>
  );
  if (!c) return null;

  const milestones    = c.milestones || [];
  const progressPct   = c.status === 'completed' ? 100 : c.progress || 0;
  const deadline      = deadlineInfo;

  return (
    <div className="space-y-8 text-white relative">
      {/* ambient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl" />
      </div>

      {/* Back */}
      <button onClick={() => navigate(-1)} className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors">
        ← Back to Contracts
      </button>

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-[36px] p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold">{c.gig?.title}</h2>
            <p className="text-slate-400 mt-2 text-sm font-mono">Contract ID: {c._id}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${STATUS_COLORS[c.status] || ''}`}>
              {c.status?.charAt(0).toUpperCase() + c.status?.slice(1)}
            </span>
            {['active','in-progress'].includes(c.status) && (
              <button onClick={handleSubmitWork} disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors disabled:opacity-50">
                {actionLoading ? 'Submitting…' : 'Submit Work'}
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Overall Progress</span>
            <span className="font-bold text-emerald-300">{progressPct}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-3 bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* ══ DEADLINE BANNER ═════════════════════════════════════ */}
      {deadline && (
        <div className={`rounded-2xl px-5 py-4 flex items-center gap-4 border ${
          deadline.isOverdue  ? 'bg-red-500/10 border-red-500/20'  :
          deadline.isDueSoon  ? 'bg-amber-500/10 border-amber-500/20' :
                                'bg-white/[0.03] border-white/10'
        }`}>
          {deadline.isOverdue
            ? <AlertTriangle className="text-red-400 shrink-0" size={18} />
            : <CalendarDays className={deadline.isDueSoon ? 'text-amber-400' : 'text-slate-400'} size={18} />
          }
          <p className={`text-sm font-semibold ${
            deadline.isOverdue ? 'text-red-300' : deadline.isDueSoon ? 'text-amber-300' : 'text-slate-300'
          }`}>
            {deadline.isOverdue
              ? `Overdue by ${deadline.daysLeft} day${deadline.daysLeft !== 1 ? 's' : ''}`
              : deadline.isDueSoon
                ? `Due in ${deadline.daysLeft} day${deadline.daysLeft !== 1 ? 's' : ''} — act now!`
                : `${deadline.daysLeft} day${deadline.daysLeft !== 1 ? 's' : ''} remaining`
            }
          </p>
          <span className="ml-auto text-xs text-slate-500">
            Deadline: {new Date(deadline.deadline).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* ══ DETAILS GRID ════════════════════════════════════════ */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Parties */}
        <div className={card}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Parties</h3>
          <div className="space-y-3">
            {[
              { label: 'Client',     u: c.client },
              { label: 'Freelancer', u: c.freelancer },
            ].map(({ label, u }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-white">
                  {u?.fullName?.[0] || '?'}
                </div>
                <div>
                  <p className="font-semibold text-slate-200">{u?.fullName}</p>
                  <p className="text-xs text-slate-500">{u?.email} · {label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financials */}
        <div className={card}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Contract Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Budget</p>
              <p className="text-2xl font-bold text-emerald-300">${c.agreedBudget?.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Delivery</p>
              <p className="text-2xl font-bold text-indigo-300">{c.deliveryTime}<span className="text-sm font-normal text-slate-500"> days</span></p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Work Submitted</p>
              <p className={`font-semibold ${c.workSubmitted ? 'text-emerald-400' : 'text-slate-500'}`}>
                {c.workSubmitted ? '✓ Yes' : 'No'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Client Approved</p>
              <p className={`font-semibold ${c.clientApproved ? 'text-emerald-400' : 'text-slate-500'}`}>
                {c.clientApproved ? '✓ Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MILESTONES ══════════════════════════════════════════ */}
      <div className={card}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ListTodo size={16} className="text-cyan-400" />
            <h3 className="font-semibold text-slate-200">Milestones</h3>
            <span className="text-xs text-slate-500 ml-1">
              {milestones.filter(m => m.completed).length}/{milestones.length} done
            </span>
          </div>
          {editingMId === null && (
            <button onClick={openAddMilestone}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-colors">
              <Plus size={13} /> Add milestone
            </button>
          )}
        </div>

        {/* Milestone form */}
        <AnimatePresence>
          {editingMId !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-5 overflow-hidden"
            >
              <p className="text-xs font-bold text-slate-300 mb-3">
                {editingMId === 'new' ? 'New milestone' : 'Edit milestone'}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <input type="text" value={milestoneForm.title}
                  onChange={e => setMilestoneForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Title *" className={inputCls} />
                <input type="number" min="0" value={milestoneForm.amount}
                  onChange={e => setMilestoneForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="Amount ($)" className={inputCls} />
                <input type="date" value={milestoneForm.dueDate}
                  onChange={e => setMilestoneForm(f => ({ ...f, dueDate: e.target.value }))}
                  className={`${inputCls} text-slate-400`} />
                <input type="text" value={milestoneForm.description}
                  onChange={e => setMilestoneForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description" className={inputCls} />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={saveMilestone} disabled={savingMilestone || !milestoneForm.title?.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-sm font-medium disabled:opacity-50">
                  {savingMilestone ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  {editingMId === 'new' ? 'Add' : 'Update'}
                </button>
                <button onClick={closeMilestoneForm} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Milestone list */}
        {milestones.length > 0 ? (
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={m._id || i}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                  m.completed
                    ? 'bg-emerald-500/5 border-emerald-500/15'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                {/* completion toggle */}
                <button
                  onClick={() => !m.completed && handleCompleteMilestone(m._id)}
                  disabled={m.completed || actionLoading}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    m.completed ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400' : 'border-white/20 hover:border-cyan-400 text-transparent hover:text-cyan-400'
                  }`}
                  aria-label={m.completed ? 'Completed' : 'Mark complete'}
                >
                  <CheckCircle2 size={16} />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-semibold ${m.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {m.title}
                    </p>
                    {m.amount > 0 && (
                      <span className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full">
                        ${m.amount.toLocaleString()}
                      </span>
                    )}
                    {m.dueDate && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <CalendarDays size={10} /> {new Date(m.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {m.description && <p className="text-xs text-slate-500 mt-1">{m.description}</p>}
                  {m.completed && m.completedAt && (
                    <p className="text-xs text-emerald-500 mt-1">
                      Completed {new Date(m.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Actions (only for incomplete milestones) */}
                {!m.completed && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEditMilestone(m)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => handleDeleteMilestone(m._id)}
                      className="w-7 h-7 rounded-lg bg-red-500/5 hover:bg-red-500/15 text-red-400/60 hover:text-red-400 flex items-center justify-center transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : editingMId === null && (
          <div className="text-center py-8">
            <ListTodo size={28} className="mx-auto text-slate-600 mb-3" />
            <p className="text-sm text-slate-500">No milestones yet. Break your project into clear steps.</p>
          </div>
        )}
      </div>

      {/* ══ PROGRESS TRACKER ════════════════════════════════════ */}
      <div className={card}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-400" />
            <h3 className="font-semibold text-slate-200">Progress Tracker</h3>
          </div>
          <button onClick={() => setShowLogs(v => !v)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            {showLogs ? 'Hide logs' : 'View logs'}
          </button>
        </div>

        {/* Post update */}
        {['active','in-progress'].includes(c.status) && (
          <div className="mb-5 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <p className="text-xs text-slate-500 mb-3">Post a progress update</p>
            <textarea
              rows={2}
              value={logNote}
              onChange={e => setLogNote(e.target.value)}
              placeholder="What did you work on? Any blockers?"
              className={`${inputCls} resize-none mb-3`}
            />
            <div className="flex items-center gap-3">
              <input type="number" min="0" max="100" value={logProgress}
                onChange={e => setLogProgress(e.target.value)}
                placeholder="Progress % (optional)"
                className={`${inputCls} w-44`} />
              <button onClick={handleAddLog} disabled={postingLog || !logNote.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-sm font-medium disabled:opacity-50">
                {postingLog ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Post update
              </button>
            </div>
          </div>
        )}

        {/* Log history */}
        <AnimatePresence>
          {showLogs && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              {progressLogs.length > 0 ? (
                <div className="relative pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-white/10" />
                  <div className="space-y-4">
                    {progressLogs.map((log, i) => (
                      <div key={i} className="relative">
                        <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-400" />
                        <div className="flex items-baseline gap-2">
                          <p className="text-sm text-slate-300">{log.note}</p>
                          {log.progress !== undefined && (
                            <span className="text-xs text-cyan-300 font-mono">{log.progress}%</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {log.loggedBy?.fullName || 'Freelancer'} · {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No progress logs yet.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══ CONTRACT TIMELINE ═══════════════════════════════════ */}
      <div className={card}>
        <h3 className="text-xl font-bold text-slate-200 mb-6">Contract Timeline</h3>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-white/10" />
          <div className="space-y-6">
            {TIMELINE_EVENTS.map(event => c[event.key] ? (
              <div key={event.key} className="flex items-start gap-4">
                <div className="relative z-10 w-10 h-10 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-lg flex-shrink-0">
                  {event.icon}
                </div>
                <div className="pt-1.5">
                  <p className="font-semibold text-slate-200 text-sm">{event.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(c[event.key]).toLocaleString()}</p>
                </div>
              </div>
            ) : null)}
          </div>
        </div>
      </div>
    </div>
  );
}
