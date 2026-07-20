import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGig, clearGigError, clearGigSuccess } from '../../store/slices/gigSlice';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Briefcase, AlignLeft, List, DollarSign, Clock, Sparkles,
  Info, CheckCircle, AlertCircle, X, Rocket, Tag,
} from 'lucide-react';

const CATEGORIES = [
  'Web Development','Mobile Development','UI/UX Design','Graphic Design',
  'Digital Marketing','Content Writing','Video & Animation','Data Science & ML',
  'DevOps & Cloud','Plumbing & Maintenance','Gardening & Landscaping',
  'Delivery & Courier','Other',
];

const EMPTY_FORM = { title:'', description:'', category:CATEGORIES[0], budget:'', skillsInput:'', deliveryTime:'' };

const STEPS = [
  { key:'title',       label:'Title',       icon:Briefcase },
  { key:'description', label:'Description', icon:AlignLeft },
  { key:'category',    label:'Category',    icon:List },
  { key:'budget',      label:'Budget',      icon:DollarSign },
  { key:'deliveryTime',label:'Timeline',    icon:Clock },
];

export default function PostJob() {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector(s => s.gig);

  const [form,            setForm]            = useState(EMPTY_FORM);
  const [validationErrors,setValidationErrors]= useState({});

  useEffect(() => { return () => { dispatch(clearGigError()); dispatch(clearGigSuccess()); }; }, [dispatch]);
  useEffect(() => {
    if (success) {
      setForm(EMPTY_FORM); setValidationErrors({});
      const t = setTimeout(() => dispatch(clearGigSuccess()), 4000);
      return () => clearTimeout(t);
    }
  }, [success, dispatch]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]:value }));
    if (validationErrors[name]) setValidationErrors(p => ({ ...p, [name]:'' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())            e.title       = 'Project title is required (min 5 chars).';
    else if (form.title.trim().length < 5) e.title   = 'Title must be at least 5 characters.';
    if (!form.description.trim())      e.description = 'Description is required.';
    else if (form.description.trim().length < 20) e.description = 'Description must be at least 20 characters.';
    if (!form.category)                e.category    = 'Category is required.';
    if (!form.budget)                  e.budget      = 'Budget is required.';
    else if (Number(form.budget) < 1)  e.budget      = 'Budget must be at least $1.';
    if (!form.deliveryTime)            e.deliveryTime = 'Delivery time is required.';
    else if (Number(form.deliveryTime) < 1) e.deliveryTime = 'Must be at least 1 day.';
    return e;
  };

  const handleSubmit = e => {
    e.preventDefault(); dispatch(clearGigError());
    const errs = validate();
    if (Object.keys(errs).length > 0) { setValidationErrors(errs); return; }
    const skills = form.skillsInput.split(',').map(s=>s.trim()).filter(Boolean);
    dispatch(createGig({ title:form.title.trim(), description:form.description.trim(), category:form.category, budget:Number(form.budget), skills, deliveryTime:Number(form.deliveryTime) }))
      .unwrap()
      .then(() => toast.success('Project Published Successfully 🚀'))
      .catch(err => toast.error(err || 'Failed to publish project'));
  };

  /* Completeness */
  const completeness = (() => {
    let c = 0;
    if (form.title.trim().length >= 5)        c += 20;
    if (form.description.trim().length >= 20) c += 20;
    if (form.category)                        c += 20;
    if (Number(form.budget) >= 1)             c += 20;
    if (Number(form.deliveryTime) >= 1)       c += 20;
    return c;
  })();

  const skillsList = form.skillsInput.split(',').map(s=>s.trim()).filter(Boolean);

  const inputStyle = (name) => ({
    width:'100%', padding:'0.875rem 1rem 0.875rem 2.75rem',
    borderRadius:'14px', fontSize:'0.875rem',
    background: validationErrors[name] ? 'rgba(251,113,133,0.05)' : 'rgba(255,255,255,0.04)',
    border:`1px solid ${validationErrors[name] ? 'rgba(251,113,133,0.4)' : 'rgba(255,255,255,0.1)'}`,
    color:'#f1f5f9', outline:'none', transition:'all 0.2s ease',
  });

  return (
    <div className="space-y-8 text-white">

      {/* ── HERO ── */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55 }}
        className="relative overflow-hidden rounded-[32px] p-10"
        style={{ background:'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.07) 100%)', border:'1px solid rgba(124,58,237,0.2)', boxShadow:'0 24px 60px rgba(0,0,0,0.3)' }}
      >
        <div className="absolute -top-20 right-[10%] w-64 h-64 rounded-full opacity-20" style={{ background:'radial-gradient(circle, rgba(124,58,237,0.6), transparent)', filter:'blur(60px)' }} />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">New Listing</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Post a New Project</h1>
            <p className="text-slate-400 mt-2 text-base max-w-xl">Publish a detailed job scope to attract premium proposals from vetted freelancers across the platform.</p>
          </div>
          {/* Completeness ring */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#ringGrad)" strokeWidth="2.5" strokeDasharray={`${completeness} 100`} strokeLinecap="round" />
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black gradient-text">{completeness}%</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-semibold">Completeness</p>
          </div>
        </div>
      </motion.div>

      {/* ── STEP INDICATORS ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STEPS.map((step, i) => {
          const filled = (() => {
            if (step.key==='title')        return form.title.trim().length >= 5;
            if (step.key==='description')  return form.description.trim().length >= 20;
            if (step.key==='category')     return !!form.category;
            if (step.key==='budget')       return Number(form.budget) >= 1;
            if (step.key==='deliveryTime') return Number(form.deliveryTime) >= 1;
            return false;
          })();
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl flex-shrink-0 transition-all"
              style={filled ? { background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.25)' } : { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <Icon size={13} className={filled ? 'text-emerald-400' : 'text-slate-600'} />
              <span className={`text-xs font-semibold ${filled ? 'text-emerald-300' : 'text-slate-600'}`}>{step.label}</span>
              {filled && <CheckCircle size={11} className="text-emerald-400" />}
            </div>
          );
        })}
      </div>

      {success && (
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          className="flex items-center gap-3 px-5 py-4 rounded-2xl"
          style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.25)' }}>
          <CheckCircle size={16} className="text-emerald-400" />
          <p className="text-sm font-semibold text-emerald-300">Project published successfully! Freelancers can now apply.</p>
        </motion.div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl" style={{ background:'rgba(251,113,133,0.1)', border:'1px solid rgba(251,113,133,0.2)' }}>
          <AlertCircle size={16} className="text-rose-400" />
          <p className="text-sm font-semibold text-rose-300">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* ── MAIN FORM ── */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.5 }}
          className="lg:col-span-2 rounded-[28px] overflow-hidden"
          style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 24px 60px rgba(0,0,0,0.3)' }}
        >
          <form onSubmit={handleSubmit} noValidate className="p-8 space-y-7">

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Project Title <span className="text-rose-400">*</span></label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Briefcase size={15} /></div>
                <input id="title" name="title" type="text" value={form.title} onChange={handleChange}
                  style={inputStyle('title')} placeholder="e.g. Build a modern e-commerce platform in React" disabled={loading} />
              </div>
              {validationErrors.title
                ? <p className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle size={11}/> {validationErrors.title}</p>
                : <p className="text-xs text-slate-600">Clear, specific titles attract higher quality proposals.</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Description <span className="text-rose-400">*</span></label>
                <span className="text-xs text-slate-600">{form.description.length} / 1000</span>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-slate-500"><AlignLeft size={15} /></div>
                <textarea id="description" name="description" rows={5} value={form.description} onChange={handleChange}
                  style={{ ...inputStyle('description'), paddingTop:'0.875rem', minHeight:'130px' }}
                  placeholder="Describe your requirements, core features, expected deliverables, and technology preferences..."
                  disabled={loading} maxLength={1000} />
              </div>
              {validationErrors.description
                ? <p className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle size={11}/> {validationErrors.description}</p>
                : <p className="text-xs text-slate-600">Include deliverables, scope, and tech stack for best results.</p>}
            </div>

            {/* Category + Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Category <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><List size={15}/></div>
                  <select id="category" name="category" value={form.category} onChange={handleChange}
                    style={inputStyle('category')} disabled={loading}>
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0c1428]">{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Budget (USD) <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><DollarSign size={15}/></div>
                  <input id="budget" name="budget" type="number" min="1" value={form.budget} onChange={handleChange}
                    style={inputStyle('budget')} placeholder="e.g. 1500" disabled={loading} />
                </div>
                {validationErrors.budget && <p className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle size={11}/> {validationErrors.budget}</p>}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Required Skills <span className="text-slate-600 font-normal normal-case">(comma-separated)</span></label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Tag size={15}/></div>
                <input id="skillsInput" name="skillsInput" type="text" value={form.skillsInput} onChange={handleChange}
                  style={inputStyle('skillsInput')} placeholder="e.g. React, TypeScript, Node.js, PostgreSQL" disabled={loading} />
              </div>
              {skillsList.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {skillsList.map(skill => (
                    <motion.span key={skill} initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} className="chip chip-violet">{skill}</motion.span>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Time */}
            <div className="space-y-2 max-w-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Delivery Deadline (days) <span className="text-rose-400">*</span></label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Clock size={15}/></div>
                <input id="deliveryTime" name="deliveryTime" type="number" min="1" value={form.deliveryTime} onChange={handleChange}
                  style={inputStyle('deliveryTime')} placeholder="e.g. 14" disabled={loading} />
              </div>
              {validationErrors.deliveryTime && <p className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle size={11}/> {validationErrors.deliveryTime}</p>}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button type="submit" disabled={loading || completeness < 100}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all"
                style={{
                  background: completeness === 100
                    ? 'linear-gradient(135deg, #7C3AED, #06B6D4)'
                    : 'rgba(255,255,255,0.06)',
                  boxShadow: completeness === 100 ? '0 8px 32px rgba(124,58,237,0.4)' : 'none',
                  color: completeness === 100 ? '#fff' : '#475569',
                  border: completeness === 100 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  cursor: loading || completeness < 100 ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => completeness===100 && (e.currentTarget.style.transform='translateY(-1px)')}
                onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Publishing...</>
                ) : (
                  <><Rocket size={16} /> {completeness < 100 ? `Complete form (${completeness}%)` : 'Publish Project'}</>
                )}
              </button>
              {completeness < 100 && (
                <p className="text-xs text-slate-600 mt-2">Fill all required fields to unlock publishing.</p>
              )}
            </div>
          </form>
        </motion.div>

        {/* ── SIDEBAR TIPS ── */}
        <div className="space-y-5">
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2, duration:0.5 }}
            className="rounded-[24px] overflow-hidden"
            style={{ background:'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))', border:'1px solid rgba(124,58,237,0.25)' }}
          >
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-violet-300" />
                <h4 className="font-bold text-sm text-violet-300 uppercase tracking-wider">Pro Tip</h4>
              </div>
              <p className="text-slate-200 text-sm font-semibold leading-relaxed mb-2">"Projects with clear descriptions receive 3× more proposals."</p>
              <p className="text-slate-400 text-xs leading-relaxed">Include specific deliverables, scope boundaries, and technology criteria to secure the most relevant applications.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3, duration:0.5 }}
            className="rounded-[24px] p-6"
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Info size={15} className="text-slate-500" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Best Practices</h4>
            </div>
            <ul className="space-y-3">
              {[
                'Keep budgets within realistic bounds to attract top talent.',
                'Break large goals into chunks in your description.',
                'List primary tech skills first for better matching.',
                'Set realistic delivery timelines (add 20% buffer).',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background:'rgba(124,58,237,0.15)' }}>
                    <span className="text-[8px] font-black text-violet-300">{i+1}</span>
                  </div>
                  {tip}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Category preview */}
          {form.category && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="rounded-[24px] p-5"
              style={{ background:'rgba(6,182,212,0.06)', border:'1px solid rgba(6,182,212,0.15)' }}>
              <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">Selected Category</p>
              <p className="text-sm font-semibold text-slate-200">{form.category}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
