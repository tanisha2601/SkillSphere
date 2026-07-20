import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  getAllGigs,
  updateGig,
  deleteGig,
  clearGigError,
  clearGigSuccess,
} from '../../store/slices/gigSlice';
import {
  Search,
  FolderKanban,
  FolderOpen,
  CheckCircle,
  Send,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Calendar,
  DollarSign,
  Clock,
  Briefcase,
  AlertCircle,
  X,
  SlidersHorizontal,
  LayoutGrid,
  ArrowUpRight,
  Layers,
} from 'lucide-react';

const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Digital Marketing',
  'Content Writing',
  'Video & Animation',
  'Data Science & ML',
  'DevOps & Cloud',
  'Plumbing & Maintenance',
  'Gardening & Landscaping',
  'Delivery & Courier',
  'Other',
];

const STATUS_CHIP = {
  open: 'chip chip-emerald',
  'in-progress': 'chip chip-amber',
  completed: 'chip chip-violet',
  cancelled: 'chip chip-rose',
};

const STATUS_LEFT = {
  open: 'rgba(52,211,153,0.6)',
  'in-progress': 'rgba(251,191,36,0.6)',
  completed: 'rgba(139,92,246,0.6)',
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

/* ── Skeleton ── */
function SkeletonCard() {
  return <div className="shimmer rounded-[24px] h-[240px]" />;
}

/* ── Edit Modal ── */
function EditModal({ gig, onClose, onSave, loading }) {
  const [form, setForm] = useState({
    title: gig.title || '',
    description: gig.description || '',
    category: gig.category || CATEGORIES[0],
    budget: gig.budget || '',
    skillsInput: (gig.skills || []).join(', '),
    deliveryTime: gig.deliveryTime || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    else if (form.title.trim().length < 5) e.title = 'Min 5 characters.';
    if (!form.description.trim()) e.description = 'Description is required.';
    else if (form.description.trim().length < 20) e.description = 'Min 20 characters.';
    if (!form.budget || Number(form.budget) < 1) e.budget = 'Budget must be ≥ $1.';
    if (!form.deliveryTime || Number(form.deliveryTime) < 1) e.deliveryTime = 'Min 1 day.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const skills = form.skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      budget: Number(form.budget),
      skills,
      deliveryTime: Number(form.deliveryTime),
    });
  };

  const fieldStyle = (name) => ({
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '12px',
    fontSize: '0.875rem',
    background: errors[name] ? 'rgba(251,113,133,0.05)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${errors[name] ? 'rgba(251,113,133,0.4)' : 'rgba(255,255,255,0.1)'}`,
    color: '#f1f5f9',
    outline: 'none',
    transition: 'all 0.2s ease',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,8,24,0.85)', backdropFilter: 'blur(16px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] text-white"
        style={{
          background: '#0c1020',
          border: '1px solid rgba(124,58,237,0.25)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        }}
      >
        <div
          className="flex items-center justify-between px-8 py-6"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.15)' }}
            >
              <Edit2 size={15} className="text-violet-300" />
            </div>
            <h3 className="text-lg font-bold">Edit Project</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Project Title *
            </label>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              style={fieldStyle('title')}
              disabled={loading}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle size={11} /> {errors.title}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              style={{ ...fieldStyle('description'), minHeight: '100px' }}
              disabled={loading}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle size={11} /> {errors.description}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={fieldStyle('category')}
                disabled={loading}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0c1020]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Budget (USD) *
              </label>
              <input
                name="budget"
                type="number"
                min="1"
                value={form.budget}
                onChange={handleChange}
                style={fieldStyle('budget')}
                disabled={loading}
              />
              {errors.budget && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.budget}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Required Skills
            </label>
            <input
              name="skillsInput"
              type="text"
              value={form.skillsInput}
              onChange={handleChange}
              style={fieldStyle('skillsInput')}
              placeholder="React, Node.js, TypeScript"
              disabled={loading}
            />
            {form.skillsInput && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.skillsInput
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((skill) => (
                    <span key={skill} className="chip chip-violet">
                      {skill}
                    </span>
                  ))}
              </div>
            )}
          </div>
          <div className="max-w-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Delivery Time (days) *
            </label>
            <input
              name="deliveryTime"
              type="number"
              min="1"
              value={form.deliveryTime}
              onChange={handleChange}
              style={fieldStyle('deliveryTime')}
              disabled={loading}
            />
            {errors.deliveryTime && (
              <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle size={11} /> {errors.deliveryTime}
              </p>
            )}
          </div>
          <div
            className="flex justify-end gap-3 pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Delete Dialog ── */
function DeleteConfirm({ gig, onCancel, onConfirm, loading }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,8,24,0.85)', backdropFilter: 'blur(16px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="p-8 max-w-md w-full rounded-[28px] text-white space-y-6"
        style={{
          background: '#0c1020',
          border: '1px solid rgba(251,113,133,0.25)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(251,113,133,0.12)',
              border: '1px solid rgba(251,113,133,0.25)',
            }}
          >
            <Trash2 size={22} className="text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Delete Project?</h3>
            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <div
          className="px-4 py-3 rounded-2xl text-sm font-semibold text-slate-300"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {gig.title}
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={loading} className="btn-secondary">
            Keep It
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #dc2626, #f43f5e)',
              boxShadow: '0 6px 20px rgba(244,63,94,0.3)',
            }}
          >
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main ── */
export default function ClientManageGigs() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { gigs, loading, success, error } = useSelector((s) => s.gig);
  const { user } = useSelector((s) => s.auth);

  const [editingGig, setEditingGig] = useState(null);
  const [deletingGig, setDeletingGig] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    dispatch(getAllGigs());
    return () => {
      dispatch(clearGigError());
      dispatch(clearGigSuccess());
    };
  }, [dispatch]);
  useEffect(() => {
    if (success) {
      setEditingGig(null);
      setDeletingGig(null);
      const t = setTimeout(() => dispatch(clearGigSuccess()), 3000);
      return () => clearTimeout(t);
    }
  }, [success, dispatch]);

  const myGigs = gigs.filter((g) => g.client?._id === user?._id || g.client === user?._id);
  const totalProjects = myGigs.length;
  const openProjects = myGigs.filter((g) => g.status === 'open').length;
  const completedProjs = myGigs.filter((g) => g.status === 'completed').length;
  const totalProposals = myGigs.reduce(
    (s, g) => s + (g.proposalsCount ?? g.proposals?.length ?? 0),
    0
  );

  const handleEditSave = (gigData) => dispatch(updateGig({ id: editingGig._id, gigData }));
  const handleDeleteConfirm = () => dispatch(deleteGig(deletingGig._id));

  const filteredGigs = myGigs
    .filter(
      (g) =>
        g.title?.toLowerCase().includes(search.toLowerCase()) ||
        g.category?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'budget') return b.budget - a.budget;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  return (
    <div className="space-y-8 text-white">
      {/* Modals */}
      {editingGig && (
        <EditModal
          gig={editingGig}
          onClose={() => {
            setEditingGig(null);
            dispatch(clearGigError());
          }}
          onSave={handleEditSave}
          loading={loading}
        />
      )}
      {deletingGig && (
        <DeleteConfirm
          gig={deletingGig}
          onCancel={() => setDeletingGig(null)}
          onConfirm={handleDeleteConfirm}
          loading={loading}
        />
      )}

      {/* ── HERO ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-[32px] p-10"
        style={{
          background:
            'linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(124,58,237,0.06) 100%)',
          border: '1px solid rgba(52,211,153,0.18)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(52,211,153,0.5), transparent)',
            filter: 'blur(60px)',
          }}
        />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
              Project Management
            </p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">My Posted Projects</h1>
            <p className="text-slate-400 mt-2 text-base">
              Create, monitor, and configure your hiring jobs to attract top talent.
            </p>
          </div>
          <Link
            to="/client/post-job"
            className="btn-primary flex-shrink-0 w-fit"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
          >
            <Plus size={16} /> Post New Project
          </Link>
        </div>
      </motion.div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Projects',
            value: totalProjects,
            icon: FolderKanban,
            color: '#a78bfa',
            bg: 'rgba(124,58,237,0.1)',
            border: 'rgba(124,58,237,0.2)',
          },
          {
            label: 'Open Jobs',
            value: openProjects,
            icon: FolderOpen,
            color: '#34d399',
            bg: 'rgba(52,211,153,0.1)',
            border: 'rgba(52,211,153,0.2)',
          },
          {
            label: 'Completed',
            value: completedProjs,
            icon: CheckCircle,
            color: '#22d3ee',
            bg: 'rgba(6,182,212,0.1)',
            border: 'rgba(6,182,212,0.2)',
          },
          {
            label: 'Total Proposals',
            value: totalProposals,
            icon: Send,
            color: '#fbbf24',
            bg: 'rgba(251,191,36,0.1)',
            border: 'rgba(251,191,36,0.2)',
          },
        ].map((s, i) => {
          const Icon = s.icon;
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
                  style={{ background: s.bg, border: `1px solid ${s.border}` }}
                >
                  <Icon size={18} style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                {s.label}
              </p>
              <p className="text-3xl font-black" style={{ color: s.color }}>
                {s.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* ── FILTERS ── */}
      <div className="flex flex-col md:flex-row gap-3">
        <div
          className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Search size={15} className="text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or category..."
            className="bg-transparent outline-none flex-1 text-slate-200 placeholder-slate-600 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={14} className="text-slate-500 hover:text-slate-300 transition" />
            </button>
          )}
        </div>
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
            <option value="newest" className="bg-[#0c1020]">
              Newest First
            </option>
            <option value="budget" className="bg-[#0c1020]">
              Highest Budget
            </option>
            <option value="status" className="bg-[#0c1020]">
              Sort by Status
            </option>
          </select>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div
          className="flex items-center gap-3 rounded-2xl px-5 py-4"
          style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}
        >
          <CheckCircle size={16} className="text-emerald-400" />
          <p className="text-sm font-semibold text-emerald-300">Changes applied successfully!</p>
        </div>
      )}
      {error && !editingGig && !deletingGig && (
        <div
          className="flex items-center gap-3 rounded-2xl px-5 py-4"
          style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.2)' }}
        >
          <AlertCircle size={16} className="text-rose-400" />
          <p className="text-sm font-semibold text-rose-300">{error}</p>
        </div>
      )}

      {/* ── GRID ── */}
      {loading && !editingGig && !deletingGig ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !loading && filteredGigs.length === 0 ? (
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
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}
          >
            📋
          </div>
          <h3 className="text-xl font-bold">No projects found</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-xs">
            {search ? 'Try different search terms.' : 'Get started by creating your first project.'}
          </p>
          {!search && (
            <Link to="/client/post-job" className="btn-primary mt-6">
              Post First Project
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredGigs.map((gig, gi) => {
            const pc = gig.proposalsCount ?? gig.proposals?.length ?? 0;
            const lb = STATUS_LEFT[gig.status] || 'rgba(148,163,184,0.4)';
            return (
              <motion.div
                key={gig._id}
                custom={gi}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="relative rounded-[24px] overflow-hidden flex flex-col transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'rgba(52,211,153,0.2)';
                  e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Status left bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: lb }} />

                <div className="p-7 pl-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={STATUS_CHIP[gig.status] || 'chip chip-slate'}>
                      {gig.status}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{gig.category}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 line-clamp-2 mb-1">
                    {gig.title}
                  </h3>

                  {/* Skill tags */}
                  {gig.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
                      {gig.skills.slice(0, 3).map((s) => (
                        <span key={s} className="chip chip-slate">
                          {s}
                        </span>
                      ))}
                      {gig.skills.length > 3 && (
                        <span className="chip chip-slate">+{gig.skills.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Metrics */}
                  <div
                    className="grid grid-cols-3 gap-2 mt-auto pt-4"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-0.5">
                        Budget
                      </p>
                      <p className="text-sm font-black text-emerald-300">
                        ${gig.budget?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-0.5">
                        Deadline
                      </p>
                      <p className="text-sm font-bold text-slate-200">{gig.deliveryTime}d</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-0.5">
                        Proposals
                      </p>
                      <p className="text-sm font-black text-violet-300">{pc}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center justify-between mt-5 pt-4"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          dispatch(clearGigError());
                          setEditingGig(gig);
                        }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all text-slate-400"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#a78bfa';
                          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#64748b';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }}
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeletingGig(gig)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all text-slate-400"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#fb7185';
                          e.currentTarget.style.borderColor = 'rgba(251,113,133,0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#64748b';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/client/proposals/${gig._id}`)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: 'rgba(124,58,237,0.12)',
                          color: '#a78bfa',
                          border: '1px solid rgba(124,58,237,0.2)',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = 'rgba(124,58,237,0.2)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = 'rgba(124,58,237,0.12)')
                        }
                      >
                        Proposals
                      </button>
                      <Link
                        to={`/gig/${gig._id}`}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all text-slate-400"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#22d3ee';
                          e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#64748b';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }}
                        title="View Public Page"
                      >
                        <ExternalLink size={13} />
                      </Link>
                    </div>
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
