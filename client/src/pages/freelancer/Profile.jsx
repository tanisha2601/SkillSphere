import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import {
  Camera, BadgeCheck, Briefcase, Star, Clock3, DollarSign, MapPin,
  GraduationCap, FileText, Globe2, Code2, ExternalLink, Link2, Award,
  BarChart3, Bell, Eye, Users, TrendingUp, CheckCircle2, MessageSquare,
  GitCommit, GitBranch, Languages, Pencil, Send, Upload, RefreshCw,
  ChevronRight, Plus, X, Trash2, Check, Loader2, Building2, Calendar, Shield,
} from 'lucide-react';

import {
  setProfile, setStats, updateProfileField, setSubResource, profileLoadStart, profileLoadError,
} from '../../store/slices/profileSlice';

import {
  fetchMyVerificationStatus, submitVerificationRequest, clearVerificationError
} from '../../store/slices/verificationSlice';

import {
  getProfile as apiGetProfile,
  updateProfile as apiUpdateProfile,
  getProfileStats as apiGetProfileStats,
  uploadAvatar as apiUploadAvatar,
  uploadResume as apiUploadResume,
  addPortfolioProject, updatePortfolioProject, deletePortfolioProject,
  addCertification, updateCertification, deleteCertification,
  addWorkExperience, updateWorkExperience, deleteWorkExperience,
  getActivityFeed,
} from '../../services/profileService';

import { getNotifications } from '../../services/notificationService';

/* ─────────────────────────────────────────────────────────────────
   Animation variants
───────────────────────────────────────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.02 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

/* ─────────────────────────────────────────────────────────────────
   Style constants
───────────────────────────────────────────────────────────────── */
const glass = 'bg-white/[0.04] backdrop-blur-3xl border border-white/10 rounded-3xl';
const glassInput =
  'w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30 transition-colors';
const glassInputSm =
  'rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30 transition-colors';

/* ─────────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────────── */
function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-400/70 mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────── */
/**
 * normalizeUrl – used at DISPLAY time.
 * Prepends https:// if no protocol is present.
 */
const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

/**
 * sanitizeUrl – used at SAVE time.
 * Strips leading/trailing whitespace, prepends https:// if missing.
 * Guards against accidental concatenation: if the value contains more
 * than one https?:// segment, keep only the LAST (most recently typed).
 */
const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  // Split on multiple protocol occurrences and take the last segment
  const parts = trimmed.split(/(?=https?:\/\/)/i).filter(Boolean);
  const best = parts.length > 1 ? parts[parts.length - 1].trim() : trimmed;
  // Prepend https:// if still missing
  return /^https?:\/\//i.test(best) ? best : `https://${best}`;
};

const serverUrl = (path) => {
  if (!path) return '';
  // If already absolute leave it alone, otherwise prepend dev server
  if (/^https?:\/\//i.test(path)) return path;
  return `http://localhost:5000${path}`;
};

const formatRelativeTime = (date) => {
  if (!date) return '';
  const then = new Date(date);
  if (Number.isNaN(then.getTime())) return '';
  const diffMs = Date.now() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return then.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

const notificationMeta = {
  proposal:          { icon: Send,         accent: 'text-blue-400' },
  payment:           { icon: DollarSign,   accent: 'text-emerald-400' },
  review:            { icon: Star,         accent: 'text-amber-400' },
  message:           { icon: MessageSquare, accent: 'text-fuchsia-400' },
  new_proposal:      { icon: Send,         accent: 'text-blue-400' },
  proposal_accepted: { icon: CheckCircle2, accent: 'text-emerald-400' },
  payment_received:  { icon: DollarSign,   accent: 'text-emerald-400' },
  review_added:      { icon: Star,         accent: 'text-amber-400' },
  new_message:       { icon: MessageSquare, accent: 'text-fuchsia-400' },
  system:            { icon: Bell,         accent: 'text-slate-400' },
};

const buildCompletionSuggestions = (f) => {
  const suggestions = [];
  if (!f?.bio) suggestions.push('Add a short professional bio');
  if (!f?.skills?.length) suggestions.push('List your top skills');
  if (!f?.portfolioProjects?.length) suggestions.push('Add at least one portfolio project');
  if (!f?.certifications?.length) suggestions.push('Add certifications to boost credibility');
  if (!f?.resumeUrl) suggestions.push('Upload your resume');
  if (!f?.phone) suggestions.push('Verify your phone number');
  if (!f?.github && !f?.linkedin && !f?.website) suggestions.push('Add your social / portfolio links');
  return suggestions.slice(0, 4);
};

const defaultBio =
  'Passionate Full Stack Developer specializing in MERN stack development, modern UI design, scalable backend systems, and real-world web applications.';

const availabilityOptions = ['Available', 'Busy', 'Unavailable'];

const emptyProject = { title: '', description: '', techStack: [], github: '', liveDemo: '', status: 'Development', image: '' };
const emptyCertification = { title: '', issuer: '', year: '', credentialUrl: '' };
const emptyWorkExp = { title: '', company: '', year: '', description: '' };

/* ─────────────────────────────────────────────────────────────────
   STATUS BADGE COLOR
───────────────────────────────────────────────────────────────── */
const statusColor = {
  Live:        'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  Completed:   'bg-blue-500/15    text-blue-300    border-blue-500/20',
  Development: 'bg-amber-500/15   text-amber-300   border-amber-500/20',
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function Profile() {
  const dispatch  = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const { profile: cachedProfile } = useSelector((s) => s.profile);
  const { myStatus: verStatus, actionLoading: verLoading } = useSelector((s) => s.verification);

  /* ── local state ── */
  const [form,    setForm]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const editSnapshotRef    = useRef(null);
  const [languagesText,    setLanguagesText]    = useState('');

  // Skills
  const [newSkill,      setNewSkill]      = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(80);

  // Portfolio
  const [projectForm,         setProjectForm]         = useState(emptyProject);
  const [projectTechText,     setProjectTechText]     = useState('');
  const [projectEditingIndex, setProjectEditingIndex] = useState(null); // null=closed, -1=adding, n=editing idx
  const [savingProject,       setSavingProject]       = useState(false);

  // Certifications
  const [certForm,         setCertForm]         = useState(emptyCertification);
  const [certEditingIndex, setCertEditingIndex] = useState(null);
  const [savingCert,       setSavingCert]       = useState(false);

  // Work Experience
  const [workForm,         setWorkForm]         = useState(emptyWorkExp);
  const [workEditingIndex, setWorkEditingIndex] = useState(null);
  const [savingWork,       setSavingWork]       = useState(false);

  // Pricing plans
  const [editingPricing, setEditingPricing] = useState(false);
  const [pricingForm,    setPricingForm]    = useState({ basic: {}, standard: {}, premium: {} });
  const [savingPricing,  setSavingPricing]  = useState(false);

  // Notifications (from real Notification collection)
  const [profileNotifications, setProfileNotifications] = useState([]);

  // Uploads
  const avatarInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  /* ─────────────────────────────────────────────────────────────
     LOAD PROFILE
  ───────────────────────────────────────────────────────────── */
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    dispatch(profileLoadStart());
    try {
      const [profileRes, statsRes, notifRes] = await Promise.all([
        apiGetProfile(),
        apiGetProfileStats().catch(() => null),
        getNotifications().catch(() => null),
      ]);

      const profileData = profileRes?.user || {};
      const statsData   = statsRes   || {};

      const merged = {
        ...profileData,
        profileCompletion:  statsData?.completion      ?? profileData?.profileCompletion,
        profileViews:       statsData?.profileViews    ?? profileData?.profileViews,
        applicationsSent:   statsData?.applicationsSent ?? profileData?.applicationsSent,
        completedProjects:  statsData?.completedProjects ?? profileData?.completedProjects,
        totalReviews:       statsData?.totalReviews    ?? profileData?.totalReviews,
        clientsWorkedWith:  statsData?.clientsWorkedWith ?? profileData?.clientsWorkedWith,
        responseRate:       statsData?.responseRate    ?? profileData?.responseRate,
        repeatClients:      statsData?.repeatClients   ?? profileData?.repeatClients,
      };

      setForm(merged);
      dispatch(setProfile(merged));
      dispatch(setStats(statsData));

      // Real notifications from the Notification collection
      if (notifRes?.data?.notifications) {
        setProfileNotifications(notifRes.data.notifications);
      }
    } catch (err) {
      console.error(err);
      const msg = err?.message || 'Failed to load profile. Please try again.';
      setError(msg);
      dispatch(profileLoadError(msg));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  /* ─────────────────────────────────────────────────────────────
     GENERIC PERSIST (full PUT — used for basic info, skills, pricing, availability)
  ───────────────────────────────────────────────────────────── */
  const persist = async (updatedForm) => {
    try {
      const res = await apiUpdateProfile(updatedForm);
      const updated = res?.user ?? updatedForm;
      setForm((prev) => ({ ...prev, ...updated }));
      dispatch(updateProfileField(updated));
      return true;
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Failed to save changes. Please try again.');
      return false;
    }
  };

  /* ─────────────────────────────────────────────────────────────
     BASIC INFO EDITING
  ───────────────────────────────────────────────────────────── */
  const startEditing = () => {
    editSnapshotRef.current = form;
    setLanguagesText(form?.languages?.length ? form.languages.join(', ') : '');
    setEditing(true);
  };

  const cancelEditing = () => {
    if (editSnapshotRef.current) setForm(editSnapshotRef.current);
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const languages = languagesText.split(',').map((s) => s.trim()).filter(Boolean);
    // Sanitize social links at save time to prevent malformed concatenated URLs
    const updated = {
      ...form,
      languages,
      github:   sanitizeUrl(form?.github),
      linkedin: sanitizeUrl(form?.linkedin),
      website:  sanitizeUrl(form?.website),
    };
    setForm(updated);
    const ok = await persist(updated);
    setSaving(false);
    if (ok) setEditing(false);
  };

  /* ─────────────────────────────────────────────────────────────
     AVAILABILITY
  ───────────────────────────────────────────────────────────── */
  const handleAvailabilityChange = async (opt) => {
    const updated = { ...form, availabilityStatus: opt };
    setForm(updated);
    await persist(updated);
  };

  /* ─────────────────────────────────────────────────────────────
     SKILLS CRUD
  ───────────────────────────────────────────────────────────── */
  const handleAddSkill = async () => {
    const skill = newSkill.trim();
    if (!skill) return;
    if (form?.skills?.some((s) => (typeof s === 'string' ? s : s?.name || '').toLowerCase() === skill.toLowerCase())) {
      setNewSkill('');
      return;
    }
    const level = Math.min(100, Math.max(1, Number(newSkillLevel) || 80));
    const updated = { ...form, skills: [...(form?.skills || []), { name: skill, level }] };
    setForm(updated);
    setNewSkill('');
    setNewSkillLevel(80);
    await persist(updated);
  };

  const handleRemoveSkill = async (skill) => {
    const updated = {
      ...form,
      skills: (form?.skills || []).filter(
        (s) => (typeof s === 'string' ? s : s?.name) !== (typeof skill === 'string' ? skill : skill?.name)
      ),
    };
    setForm(updated);
    await persist(updated);
  };

  /* ─────────────────────────────────────────────────────────────
     VERIFICATION UPLOAD
  ───────────────────────────────────────────────────────────── */
  const verDocsRef = useRef(null);
  const handleVerificationUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const fd = new FormData();
    for (let i = 0; i < files.length; i++) {
      fd.append('documents', files[i]);
    }
    await dispatch(submitVerificationRequest(fd));
    dispatch(fetchMyVerificationStatus());
  };

  /* ─────────────────────────────────────────────────────────────
     AVATAR / RESUME UPLOADS
  ───────────────────────────────────────────────────────────── */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await apiUploadAvatar(fd);
      setForm((prev) => ({ ...prev, avatar: res?.avatar || res?.user?.avatar || '' }));
      dispatch(updateProfileField({ avatar: res?.avatar || res?.user?.avatar || '' }));
    } catch (err) {
      toast.error(err?.message || 'Failed to upload avatar.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const res = await apiUploadResume(fd);
      const url = res?.resumeUrl || res?.user?.resumeUrl;
      setForm((prev) => ({ ...prev, resumeUrl: url }));
      dispatch(updateProfileField({ resumeUrl: url }));
    } catch (err) {
      toast.error(err?.message || 'Resume upload failed');
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  /* ─────────────────────────────────────────────────────────────
     PORTFOLIO CRUD  (granular API)
  ───────────────────────────────────────────────────────────── */
  const openAddProject = () => {
    setProjectForm(emptyProject);
    setProjectTechText('');
    setProjectEditingIndex(-1);
  };

  const openEditProject = (i) => {
    const p = form?.portfolioProjects?.[i] || emptyProject;
    setProjectForm(p);
    setProjectTechText(p?.techStack?.join(', ') || '');
    setProjectEditingIndex(i);
  };

  const closeProjectForm = () => {
    setProjectEditingIndex(null);
    setProjectForm(emptyProject);
    setProjectTechText('');
  };

  const saveProject = async () => {
    if (!projectForm.title?.trim()) return;
    setSavingProject(true);
    const techStack = projectTechText.split(',').map((s) => s.trim()).filter(Boolean);
    const entry     = { ...projectForm, techStack };

    try {
      let res;
      if (projectEditingIndex === -1) {
        // ADD
        res = await addPortfolioProject(entry);
      } else {
        // EDIT — use sub-document _id
        const existingId = form?.portfolioProjects?.[projectEditingIndex]?._id;
        res = await updatePortfolioProject(existingId, entry);
      }
      const newList = res?.portfolioProjects ?? [];
      setForm((prev) => ({ ...prev, portfolioProjects: newList }));
      dispatch(setSubResource({ key: 'portfolioProjects', data: newList }));
      closeProjectForm();
    } catch (err) {
      toast.error(err?.message || 'Failed to save project');
    } finally {
      setSavingProject(false);
    }
  };

  const deleteProject = async (i) => {
    const id = form?.portfolioProjects?.[i]?._id;
    if (!id) return;
    try {
      const res = await deletePortfolioProject(id);
      const newList = res?.portfolioProjects ?? (form?.portfolioProjects || []).filter((_, idx) => idx !== i);
      setForm((prev) => ({ ...prev, portfolioProjects: newList }));
      dispatch(setSubResource({ key: 'portfolioProjects', data: newList }));
    } catch (err) {
      toast.error(err?.message || 'Failed to delete project');
    }
  };

  /* ─────────────────────────────────────────────────────────────
     CERTIFICATION CRUD  (granular API)
  ───────────────────────────────────────────────────────────── */
  const openAddCert = () => {
    setCertForm(emptyCertification);
    setCertEditingIndex(-1);
  };

  const openEditCert = (i) => {
    setCertForm(form?.certifications?.[i] || emptyCertification);
    setCertEditingIndex(i);
  };

  const closeCertForm = () => {
    setCertEditingIndex(null);
    setCertForm(emptyCertification);
  };

  const saveCert = async () => {
    if (!certForm.title?.trim()) return;
    setSavingCert(true);
    const entry = { ...certForm, year: certForm.year ? Number(certForm.year) : undefined };

    try {
      let res;
      if (certEditingIndex === -1) {
        res = await addCertification(entry);
      } else {
        const id = form?.certifications?.[certEditingIndex]?._id;
        res = await updateCertification(id, entry);
      }
      const newList = res?.certifications ?? [];
      setForm((prev) => ({ ...prev, certifications: newList }));
      dispatch(setSubResource({ key: 'certifications', data: newList }));
      closeCertForm();
    } catch (err) {
      toast.error(err?.message || 'Failed to save certification');
    } finally {
      setSavingCert(false);
    }
  };

  const deleteCert = async (i) => {
    const id = form?.certifications?.[i]?._id;
    if (!id) return;
    try {
      const res = await deleteCertification(id);
      const newList = res?.certifications ?? (form?.certifications || []).filter((_, idx) => idx !== i);
      setForm((prev) => ({ ...prev, certifications: newList }));
      dispatch(setSubResource({ key: 'certifications', data: newList }));
    } catch (err) {
      toast.error(err?.message || 'Failed to delete certification');
    }
  };

  /* ─────────────────────────────────────────────────────────────
     WORK EXPERIENCE CRUD  (granular API)
  ───────────────────────────────────────────────────────────── */
  const openAddWork = () => {
    setWorkForm(emptyWorkExp);
    setWorkEditingIndex(-1);
  };

  const openEditWork = (i) => {
    setWorkForm(form?.workTimeline?.[i] || emptyWorkExp);
    setWorkEditingIndex(i);
  };

  const closeWorkForm = () => {
    setWorkEditingIndex(null);
    setWorkForm(emptyWorkExp);
  };

  const saveWork = async () => {
    if (!workForm.title?.trim()) return;
    setSavingWork(true);
    const entry = { ...workForm, year: workForm.year ? Number(workForm.year) : undefined };

    try {
      let res;
      if (workEditingIndex === -1) {
        res = await addWorkExperience(entry);
      } else {
        const id = form?.workTimeline?.[workEditingIndex]?._id;
        res = await updateWorkExperience(id, entry);
      }
      const newList = res?.workTimeline ?? [];
      setForm((prev) => ({ ...prev, workTimeline: newList }));
      dispatch(setSubResource({ key: 'workTimeline', data: newList }));
      closeWorkForm();
    } catch (err) {
      toast.error(err?.message || 'Failed to save work experience');
    } finally {
      setSavingWork(false);
    }
  };

  const deleteWork = async (i) => {
    const id = form?.workTimeline?.[i]?._id;
    if (!id) return;
    try {
      const res = await deleteWorkExperience(id);
      const newList = res?.workTimeline ?? (form?.workTimeline || []).filter((_, idx) => idx !== i);
      setForm((prev) => ({ ...prev, workTimeline: newList }));
      dispatch(setSubResource({ key: 'workTimeline', data: newList }));
    } catch (err) {
      toast.error(err?.message || 'Failed to delete work experience');
    }
  };

  /* ─────────────────────────────────────────────────────────────
     PRICING PLANS
  ───────────────────────────────────────────────────────────── */
  const startEditingPricing = () => {
    setPricingForm({
      basic:    { price: form?.pricingPlans?.basic?.price    ?? 0, description: form?.pricingPlans?.basic?.description    ?? '' },
      standard: { price: form?.pricingPlans?.standard?.price ?? 0, description: form?.pricingPlans?.standard?.description ?? '' },
      premium:  { price: form?.pricingPlans?.premium?.price  ?? 0, description: form?.pricingPlans?.premium?.description  ?? '' },
    });
    setEditingPricing(true);
  };

  const savePricing = async () => {
    setSavingPricing(true);
    const updated = { ...form, pricingPlans: pricingForm };
    setForm(updated);
    const ok = await persist(updated);
    setSavingPricing(false);
    if (ok) setEditingPricing(false);
  };

  /* ─────────────────────────────────────────────────────────────
     LOADING / ERROR STATES
  ───────────────────────────────────────────────────────────── */
  if (loading || !form) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-white text-lg flex items-center gap-3">
          <RefreshCw className="animate-spin text-cyan-400" size={20} />
          Loading Profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-slate-300">{error}</p>
        <button
          onClick={loadProfile}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     DERIVED DATA
  ───────────────────────────────────────────────────────────── */
  const stats = [
    { icon: Briefcase,  label: 'Projects',   value: form?.completedProjects ?? 0,            accent: 'text-indigo-400' },
    { icon: Star,       label: 'Rating',      value: form?.averageRating     ?? 0,            accent: 'text-amber-400' },
    { icon: Clock3,     label: 'Experience',  value: `${form?.experience ?? 0} yrs`,          accent: 'text-cyan-400' },
    { icon: DollarSign, label: 'Earnings',    value: `$${form?.totalEarnings ?? 0}`,          accent: 'text-emerald-400' },
    { icon: Users,      label: 'Clients',     value: form?.clientsWorkedWith ?? 0,            accent: 'text-fuchsia-400' },
    { icon: Eye,        label: 'Views',       value: form?.profileViews      ?? 0,            accent: 'text-blue-400' },
  ];

  const skills = (form?.skills || []).filter((s) => {
    // Handle both {name, level} objects and plain strings
    // Strictly remove any entry where name is missing, null, undefined, or blank
    if (!s) return false;
    const name = typeof s === 'string' ? s : s?.name;
    return typeof name === 'string' && name.trim().length > 0;
  });
  const portfolio         = form?.portfolioProjects  || [];
  const certifications    = form?.certifications     || [];
  const experienceTimeline = form?.workTimeline      || [];
  const activity          = form?.activity           || [];
  const reviews           = form?.reviews            || [];

  const completion = {
    percent:     form?.profileCompletion ?? 0,
    suggestions: buildCompletionSuggestions(form),
  };

  const analytics = {
    views:             form?.analytics?.profileViews        ?? form?.profileViews         ?? 0,
    acceptanceRate:    form?.analytics?.proposalAcceptanceRate ?? 0,
    retention:         form?.analytics?.clientRetentionRate  ?? 0,
    earnings:          form?.totalEarnings                   ?? 0,
    completedProjects: form?.completedProjects               ?? 0,
  };

  const weeklyViews       = form?.analytics?.weeklyViews?.length === 7 ? form.analytics.weeklyViews : null;
  const acceptanceRingCirc = 2 * Math.PI * 42;

  const socials = {
    github:   form?.github   || '',
    linkedin: form?.linkedin || '',
    website:  form?.website  || '',
  };

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* ambient glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-[28rem] h-[28rem] rounded-full bg-blue-600/10 blur-[160px]" />
        <div className="absolute bottom-10 right-10 w-[28rem] h-[28rem] rounded-full bg-cyan-500/10 blur-[160px]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-8"
      >

        {/* ════════════════ HERO ════════════════ */}
        <motion.div variants={fadeUp} className={`${glass} overflow-hidden`}>
          <div className="flex items-center gap-2 px-6 py-3 border-b border-white/10 bg-white/[0.02]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
            <span className="ml-3 text-[11px] font-mono text-slate-500">profile.jsx — freelancer console</span>
          </div>

          <div className="p-6 lg:p-8 grid lg:grid-cols-[220px_1fr] gap-8">
            {/* Avatar column */}
            <div className="flex lg:flex-col items-center lg:items-start gap-4">
              <div className="relative shrink-0">
                <img
                  src={
                    form?.avatar
                      ? serverUrl(form.avatar)
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(form?.fullName || 'U')}&background=0f172a&color=22d3ee&bold=true`
                  }
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(form?.fullName || 'U')}&background=0f172a&color=22d3ee&bold=true`; }}
                  alt={form?.fullName || 'Profile avatar'}
                  className="w-24 h-24 lg:w-[220px] lg:h-[220px] rounded-2xl object-cover border border-white/10"
                />
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-2 -right-2 lg:bottom-3 lg:right-3 w-9 h-9 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 transition-colors disabled:opacity-60"
                  aria-label="Upload new avatar"
                >
                  {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                </button>
              </div>
              <div className="flex lg:hidden flex-col">
                <h1 className="text-2xl font-bold">{form?.fullName}</h1>
                <p className="text-slate-400 text-sm mt-0.5">{form?.title}</p>
              </div>
            </div>

            {/* Info column */}
            <div className="flex flex-col justify-between gap-6">
              <div>
                <div className="hidden lg:flex items-center gap-2">
                  {editing ? (
                    <input
                      type="text"
                      value={form?.fullName || ''}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Full name"
                      className="text-3xl font-bold tracking-tight bg-transparent border-b border-white/20 focus:border-cyan-400 outline-none w-full max-w-sm"
                    />
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold tracking-tight">{form?.fullName}</h1>
                      {form?.isVerified && <BadgeCheck className="text-cyan-400" size={22} />}
                    </>
                  )}
                </div>

                {editing ? (
                  <input
                    type="text"
                    value={form?.title || ''}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Professional title"
                    className="hidden lg:block mt-2 bg-transparent border-b border-white/10 focus:border-cyan-400 outline-none text-slate-400 w-full max-w-sm"
                  />
                ) : (
                  <p className="hidden lg:block text-slate-400 mt-1">{form?.title}</p>
                )}

                {/* Verification Status */}
                {!editing && verStatus && (
                  <div className="mt-2 flex items-center gap-3">
                    {verStatus.isIdentityVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                        <BadgeCheck size={14} /> Identity Verified
                      </span>
                    ) : verStatus.request?.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                        <Clock3 size={14} /> Verification Pending
                      </span>
                    ) : (
                      <>
                        <input type="file" ref={verDocsRef} multiple accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={handleVerificationUpload} />
                        <button
                          onClick={() => verDocsRef.current?.click()}
                          disabled={verLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                        >
                          {verLoading ? <Loader2 size={13} className="animate-spin" /> : <Shield size={14} />}
                          {verStatus.request?.status === 'rejected' ? 'Re-submit Verification' : 'Verify Identity'}
                        </button>
                        {verStatus.request?.status === 'rejected' && (
                          <span className="text-xs text-red-400">Rejected: {verStatus.request.adminNote}</span>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4 items-center">
                  {editing ? (
                    <input
                      type="text"
                      value={form?.location || ''}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="Location"
                      className={`${glassInputSm} w-40`}
                    />
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                      <MapPin size={13} className="text-slate-500" /> {form?.location || 'Location not set'}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {form?.availabilityStatus || 'Available'}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                    <Star size={13} className="fill-amber-300 text-amber-300" /> {form?.averageRating ?? 0} rating
                  </span>

                  {editing ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-300">
                      <DollarSign size={13} />
                      <input
                        type="number" min="0"
                        value={form?.hourlyRate ?? 0}
                        onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                        className="bg-transparent outline-none w-16"
                      />
                      /hr
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-300">
                      <DollarSign size={13} /> {form?.hourlyRate ?? 0}/hr
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                    <Briefcase size={13} className="text-slate-500" /> {form?.completedProjects ?? 0} projects done
                  </span>
                </div>

                {editing && (
                  <div className="grid sm:grid-cols-3 gap-2 mt-4">
                    <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                      <FaGithub size={13} className="text-slate-500 shrink-0" />
                      <input type="text" value={form?.github || ''} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="GitHub URL" className="bg-transparent outline-none text-xs text-white w-full" />
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                      <FaLinkedin size={13} className="text-slate-500 shrink-0" />
                      <input type="text" value={form?.linkedin || ''} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="LinkedIn URL" className="bg-transparent outline-none text-xs text-white w-full" />
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                      <Globe2 size={13} className="text-slate-500 shrink-0" />
                      <input type="text" value={form?.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Website URL" className="bg-transparent outline-none text-xs text-white w-full" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-slate-400">
                  {[
                    { href: socials.github,   Icon: FaGithub,   label: 'GitHub' },
                    { href: socials.linkedin, Icon: FaLinkedin, label: 'LinkedIn' },
                    { href: socials.website,  Icon: Globe2,      label: 'Website' },
                  ].map(({ href, Icon, label }) => {
                    const url = href ? normalizeUrl(href) : '';
                    return url ? (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors hover:text-white hover:border-white/20"
                      >
                        <Icon size={16} />
                      </a>
                    ) : (
                      <span
                        key={label}
                        title={`${label} not set`}
                        aria-label={`${label} (not set)`}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center opacity-30 cursor-default"
                      >
                        <Icon size={16} />
                      </span>
                    );
                  })}
                  <span className="text-xs font-mono text-slate-600 hidden sm:inline">
                    {socials.website || 'no website set'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {editing && (
                    <button
                      onClick={cancelEditing}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-60"
                    >
                      <X size={15} /> Cancel
                    </button>
                  )}
                  <button
                    onClick={() => (editing ? handleSave() : startEditing())}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Pencil size={15} />}
                    {saving ? 'Saving...' : editing ? 'Save changes' : 'Edit profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ════════════════ COMPLETION ════════════════ */}
        <motion.div variants={fadeUp} className={`${glass} p-6`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-slate-200">Profile completion</h3>
            <span className="font-mono text-sm font-bold text-emerald-300">{completion.percent}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completion.percent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
            />
          </div>
          {completion.suggestions.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {completion.suggestions.map((s, i) => (
                <li key={i} className="text-xs text-slate-400 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-1.5">
                  {s}
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* ════════════════ QUICK STATS ════════════════ */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((s, i) => (
            <motion.div key={i} whileHover={{ y: -3 }} className={`${glass} p-4 flex flex-col gap-3`}>
              <s.icon className={s.accent} size={18} />
              <div>
                <p className="text-2xl font-bold font-mono">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ════════════════ ABOUT + SKILLS ════════════════ */}
        <div className="grid xl:grid-cols-2 gap-5">
          <motion.div variants={fadeUp} className={`${glass} p-6`}>
            <SectionHeader 
              eyebrow="01 — Profile" 
              title="About me" 
              action={
                !editing && (
                  <button onClick={startEditing} className="text-slate-500 hover:text-cyan-300 transition-colors" aria-label="Edit about me">
                    <Pencil size={13} />
                  </button>
                )
              }
            />
            {editing ? (
              <textarea
                rows={6}
                value={form?.bio || ''}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell clients about yourself..."
                className={`${glassInput} resize-none leading-relaxed`}
              />
            ) : (
              <p className="text-slate-300 leading-relaxed text-sm">{form?.bio || defaultBio}</p>
            )}
          </motion.div>

          <motion.div variants={fadeUp} className={`${glass} p-6`}>
            <SectionHeader eyebrow="02 — Stack" title="Skills" />
            {/* Add skill row: name + level slider + button */}
            <div className="flex flex-col gap-2 mb-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="Skill name (e.g. TypeScript)"
                  className={`${glassInputSm} flex-1`}
                />
                <div className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2 py-1 shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono w-6 text-right">{newSkillLevel}%</span>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                    className="w-20 accent-cyan-400 cursor-pointer"
                    aria-label="Skill level"
                  />
                </div>
                <button
                  onClick={handleAddSkill}
                  className="w-9 h-9 shrink-0 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center justify-center hover:bg-cyan-500/25 transition-colors"
                  aria-label="Add skill"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => {
                  const rawName = typeof skill === 'string' ? skill : (skill?.name || '');
                  if (!rawName) return null;
                  // Capitalize: css→CSS, html→HTML, javascript→JavaScript, c++→C++
                  const upper = rawName.toUpperCase();
                  const knownAcronyms = ['CSS', 'HTML', 'SQL', 'PHP', 'XML', 'API', 'AWS', 'GQL', 'JWT'];
                  const name = knownAcronyms.includes(upper)
                    ? upper
                    : rawName.charAt(0).toUpperCase() + rawName.slice(1);
                  // Level: use stored value, fallback to 80 only if truly missing
                  const level = typeof skill === 'object' && skill?.level != null
                    ? skill.level
                    : 80;
                  return (
                    <span
                      key={i}
                      className="group inline-flex items-center gap-1 text-xs font-mono pl-3 pr-1.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 h-8 hover:border-cyan-500/30 transition-colors"
                    >
                      <span className="font-semibold tracking-wide">{name}</span>
                      <span className="text-slate-600 select-none">•</span>
                      <span className="text-[11px] font-medium text-cyan-400/80 bg-cyan-500/10 rounded-full px-1.5 py-0.5">
                        {level}%
                      </span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-600 hover:text-red-400 transition-colors ml-0.5"
                        aria-label={`Remove ${name}`}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No skills added yet.</p>
            )}
          </motion.div>
        </div>

        {/* ════════════════ PROFESSIONAL INFO ════════════════ */}
        <motion.div variants={fadeUp} className={`${glass} p-6`}>
          <SectionHeader 
            eyebrow="03 — Details" 
            title="Professional information" 
            action={
              !editing && (
                <button onClick={startEditing} className="text-slate-500 hover:text-cyan-300 transition-colors" aria-label="Edit professional info">
                  <Pencil size={13} />
                </button>
              )
            }
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {[
              { icon: GraduationCap, label: 'Education',  field: 'education',  placeholder: 'e.g. B.Tech CSE' },
              { icon: Clock3,        label: 'Experience',  field: 'experience', placeholder: '0', type: 'number' },
              { icon: Languages,     label: 'Languages',   field: null,         custom: true },
              { icon: MapPin,        label: 'Location',    field: 'location',   placeholder: 'City, Country' },
            ].map(({ icon: Icon, label, field, placeholder, type, custom }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">{label}</p>
                  {editing && !custom && (
                    <input
                      type={type || 'text'}
                      value={form?.[field] || ''}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      placeholder={placeholder}
                      className={`${glassInputSm} w-full mt-1`}
                    />
                  )}
                  {editing && custom && (
                    <input
                      type="text"
                      value={languagesText}
                      onChange={(e) => setLanguagesText(e.target.value)}
                      placeholder="English, Hindi"
                      className={`${glassInputSm} w-full mt-1`}
                    />
                  )}
                  {!editing && (
                    <p className="text-sm font-medium text-slate-200 mt-0.5">
                      {custom
                        ? (form?.languages?.length ? form.languages.join(', ') : 'Not set')
                        : (field === 'experience'
                          ? `${form?.[field] ?? 0} years`
                          : form?.[field] || 'Not set')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Plans */}
          <div className="border-t border-white/10 pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wide">Milestone pricing</p>
              {editingPricing ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingPricing(false)} disabled={savingPricing} className="text-xs text-slate-400 hover:text-white transition-colors">Cancel</button>
                  <button onClick={savePricing} disabled={savingPricing} className="inline-flex items-center gap-1 text-xs text-emerald-300 hover:text-emerald-200 transition-colors">
                    {savingPricing ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
                  </button>
                </div>
              ) : (
                <button onClick={startEditingPricing} className="text-slate-500 hover:text-cyan-300 transition-colors" aria-label="Edit pricing">
                  <Pencil size={13} />
                </button>
              )}
            </div>

            {editingPricing ? (
              <div className="grid sm:grid-cols-3 gap-4">
                {['basic', 'standard', 'premium'].map((tier) => (
                  <div key={tier} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-sm font-semibold text-slate-200 capitalize">{tier}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-cyan-300 text-sm">$</span>
                      <input
                        type="number" min="0"
                        value={pricingForm?.[tier]?.price ?? 0}
                        onChange={(e) => setPricingForm((prev) => ({ ...prev, [tier]: { ...prev[tier], price: e.target.value } }))}
                        className={`${glassInputSm} w-full`}
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={pricingForm?.[tier]?.description ?? ''}
                      onChange={(e) => setPricingForm((prev) => ({ ...prev, [tier]: { ...prev[tier], description: e.target.value } }))}
                      placeholder="What's included..."
                      className={`${glassInputSm} w-full mt-2 resize-none`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-4">
                {[{ key: 'basic', name: 'Basic' }, { key: 'standard', name: 'Standard' }, { key: 'premium', name: 'Premium' }].map((tier) => (
                  <div key={tier.key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 hover:border-cyan-400/30 transition-colors">
                    <p className="text-sm font-semibold text-slate-200">{tier.name}</p>
                    <p className="text-xl font-bold font-mono text-cyan-300 mt-1">${form?.pricingPlans?.[tier.key]?.price ?? 0}</p>
                    <p className="text-xs text-slate-500 mt-2">{form?.pricingPlans?.[tier.key]?.description || 'Not set yet'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ════════════════ PORTFOLIO ════════════════ */}
        <motion.div variants={fadeUp}>
          <SectionHeader
            eyebrow="04 — Work"
            title="Portfolio projects"
            action={
              projectEditingIndex === null && (
                <button
                  onClick={openAddProject}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                >
                  <Plus size={13} /> Add project
                </button>
              )
            }
          />

          {/* Add / Edit form */}
          <AnimatePresence>
            {projectEditingIndex !== null && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`${glass} p-5 mb-6`}
              >
                <p className="text-sm font-semibold text-slate-200 mb-4">
                  {projectEditingIndex === -1 ? 'New project' : 'Edit project'}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text" value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="Project title *"
                    className={glassInputSm}
                  />
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className={`${glassInputSm} bg-[#0f172a]`}
                  >
                    <option value="Development">Development</option>
                    <option value="Live">Live</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <input
                    type="text" value={projectForm.github}
                    onChange={(e) => setProjectForm({ ...projectForm, github: e.target.value })}
                    placeholder="GitHub link"
                    className={glassInputSm}
                  />
                  <input
                    type="text" value={projectForm.liveDemo}
                    onChange={(e) => setProjectForm({ ...projectForm, liveDemo: e.target.value })}
                    placeholder="Live demo link"
                    className={glassInputSm}
                  />
                  <input
                    type="text" value={projectForm.image}
                    onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                    placeholder="Image URL (optional)"
                    className={glassInputSm}
                  />
                  <input
                    type="text" value={projectTechText}
                    onChange={(e) => setProjectTechText(e.target.value)}
                    placeholder="Tech stack (comma separated)"
                    className={glassInputSm}
                  />
                  <textarea
                    rows={3} value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="Project description"
                    className={`${glassInputSm} sm:col-span-2 resize-none`}
                  />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={saveProject}
                    disabled={savingProject}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium disabled:opacity-60"
                  >
                    {savingProject ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    {projectEditingIndex === -1 ? 'Add project' : 'Update project'}
                  </button>
                  <button onClick={closeProjectForm} disabled={savingProject} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Project cards */}
          {portfolio.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((project, i) => (
                <motion.div
                  key={project._id || i}
                  whileHover={{ y: -4 }}
                  className={`${glass} overflow-hidden flex flex-col`}
                >
                  {project.image ? (
                    <img src={project.image} alt={project.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <Code2 size={32} className="text-slate-600" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-200 leading-snug">{project.title}</h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${statusColor[project.status] || statusColor.Development}`}>
                        {project.status}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">{project.description}</p>
                    )}

                    {project.techStack?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {project.techStack.map((t, j) => (
                          <span key={j} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                      {project.github && (
                        <a href={normalizeUrl(project.github)} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                          <FaGithub size={13} /> Code
                        </a>
                      )}
                      {project.liveDemo && (
                        <a href={normalizeUrl(project.liveDemo)} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                          <ExternalLink size={13} /> Live demo
                        </a>
                      )}
                      <div className="ml-auto flex items-center gap-1">
                        <button onClick={() => openEditProject(i)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors" aria-label="Edit project">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => deleteProject(i)} className="w-7 h-7 rounded-lg bg-red-500/5 hover:bg-red-500/15 text-red-400/60 hover:text-red-400 flex items-center justify-center transition-colors" aria-label="Delete project">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            projectEditingIndex === null && (
              <div className={`${glass} p-8`}>
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <Code2 size={40} className="text-slate-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300">No portfolio projects yet</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-md">
                    Showcase your best work by adding projects, GitHub repositories, and live demos.
                  </p>
                  <button
                    onClick={openAddProject}
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition"
                  >
                    <Plus size={16} /> Add your first project
                  </button>
                </div>
              </div>
            )
          )}
        </motion.div>

        {/* ════════════════ CERTIFICATIONS + RESUME ════════════════ */}
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Certifications */}
          <motion.div variants={fadeUp} className={`${glass} p-6 h-full min-h-[320px] flex flex-col`}>
            <SectionHeader
              eyebrow="05 — Credentials"
              title="Certifications"
              action={
                certEditingIndex === null && (
                  <button onClick={openAddCert} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                    <Plus size={13} /> Add
                  </button>
                )
              }
            />

            {/* Cert form */}
            <AnimatePresence>
              {certEditingIndex !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4 overflow-hidden"
                >
                  <p className="text-xs font-semibold text-slate-300 mb-3">
                    {certEditingIndex === -1 ? 'Add certification' : 'Edit certification'}
                  </p>
                  <div className="grid gap-2">
                    <input
                      type="text" value={certForm.title}
                      onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                      placeholder="Certification title *"
                      className={`${glassInputSm} w-full`}
                    />
                    <input
                      type="text" value={certForm.issuer}
                      onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                      placeholder="Issuing organisation"
                      className={`${glassInputSm} w-full`}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number" value={certForm.year}
                        onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}
                        placeholder="Year (e.g. 2024)"
                        className={`${glassInputSm} w-full`}
                      />
                      <input
                        type="text" value={certForm.credentialUrl}
                        onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                        placeholder="Credential URL"
                        className={`${glassInputSm} w-full`}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={saveCert} disabled={savingCert}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium disabled:opacity-60"
                    >
                      {savingCert ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      {certEditingIndex === -1 ? 'Add' : 'Update'}
                    </button>
                    <button onClick={closeCertForm} className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {certifications.length > 0 ? (
              <div className="space-y-3">
                {certifications.map((cert, i) => (
                  <div key={cert._id || i} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Award size={16} className="text-amber-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-200 truncate">{cert.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{cert.issuer} {cert.year ? `· ${cert.year}` : ''}</p>
                      {cert.credentialUrl && (
                        <a href={normalizeUrl(cert.credentialUrl)} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-1 transition-colors">
                          <ExternalLink size={11} /> View credential
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEditCert(i)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => deleteCert(i)} className="w-7 h-7 rounded-lg bg-red-500/5 hover:bg-red-500/15 text-red-400/60 hover:text-red-400 flex items-center justify-center transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              certEditingIndex === null && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-slate-500">No certifications added yet.</p>
                </div>
              )
            )}

            {/* Resume */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs text-slate-500 mb-3 font-mono uppercase tracking-wide">Resume</p>
              <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeChange} />
              <div className="flex gap-3">
                <button
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={uploadingResume}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300 hover:bg-blue-500/20 transition-colors disabled:opacity-60"
                >
                  {uploadingResume ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploadingResume ? 'Uploading...' : form?.resumeUrl ? 'Replace' : 'Upload'}
                </button>
                {form?.resumeUrl && (
                  <a
                    href={serverUrl(form.resumeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                  >
                    <FileText size={14} /> View resume
                  </a>
                )}
              </div>
              {form?.resumeUrl && (
                <p className="text-xs text-slate-600 mt-2 truncate">
                  Uploaded: {form.resumeUrl.split('/').pop()}
                </p>
              )}
            </div>
          </motion.div>

          {/* Work Experience */}
          <motion.div variants={fadeUp} className={`${glass} p-6 h-full min-h-[320px] flex flex-col`}>
            <SectionHeader
              eyebrow="06 — History"
              title="Work experience"
              action={
                workEditingIndex === null && (
                  <button onClick={openAddWork} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                    <Plus size={13} /> Add
                  </button>
                )
              }
            />

            {/* Work exp form */}
            <AnimatePresence>
              {workEditingIndex !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4 overflow-hidden"
                >
                  <p className="text-xs font-semibold text-slate-300 mb-3">
                    {workEditingIndex === -1 ? 'Add experience' : 'Edit experience'}
                  </p>
                  <div className="grid gap-2">
                    <input
                      type="text" value={workForm.title}
                      onChange={(e) => setWorkForm({ ...workForm, title: e.target.value })}
                      placeholder="Job title *"
                      className={`${glassInputSm} w-full`}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text" value={workForm.company}
                        onChange={(e) => setWorkForm({ ...workForm, company: e.target.value })}
                        placeholder="Company"
                        className={`${glassInputSm} w-full`}
                      />
                      <input
                        type="number" value={workForm.year}
                        onChange={(e) => setWorkForm({ ...workForm, year: e.target.value })}
                        placeholder="Year (e.g. 2023)"
                        className={`${glassInputSm} w-full`}
                      />
                    </div>
                    <textarea
                      rows={2} value={workForm.description}
                      onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                      placeholder="Brief description"
                      className={`${glassInputSm} w-full resize-none`}
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={saveWork} disabled={savingWork}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium disabled:opacity-60"
                    >
                      {savingWork ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      {workEditingIndex === -1 ? 'Add' : 'Update'}
                    </button>
                    <button onClick={closeWorkForm} className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {experienceTimeline.length > 0 ? (
              <div className="relative pl-6">
                <div className="absolute left-[7px] top-1 bottom-1 w-px bg-white/10" />
                <div className="space-y-6">
                  {experienceTimeline.map((item, i) => (
                    <div key={item._id || i} className="relative">
                      <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      </span>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                            <GitCommit size={12} />
                            <span>{item?.year}</span>
                          </div>
                          <h3 className="font-semibold text-slate-200 mt-1">{item?.title}</h3>
                          <p className="text-xs text-cyan-400 mt-0.5">{item?.company}</p>
                          {item?.description && (
                            <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0 mt-1">
                          <button onClick={() => openEditWork(i)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => deleteWork(i)} className="w-7 h-7 rounded-lg bg-red-500/5 hover:bg-red-500/15 text-red-400/60 hover:text-red-400 flex items-center justify-center transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              workEditingIndex === null && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Building2 size={28} className="mx-auto text-slate-600 mb-3" />
                    <p className="text-sm text-slate-500">No work experience added yet.</p>
                  </div>
                </div>
              )
            )}
          </motion.div>
        </div>

        {/* ════════════════ AVAILABILITY ════════════════ */}
        <motion.div variants={fadeUp} className={`${glass} p-6`}>
          <SectionHeader eyebrow="07 — Status" title="Availability" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {availabilityOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAvailabilityChange(opt)}
                className={`py-5 rounded-2xl border transition-all duration-300 text-sm font-semibold ${
                  form?.availabilityStatus === opt
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-lg shadow-emerald-500/10'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/5 hover:border-white/20'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Current status:
            <span className="text-slate-300 font-medium">{form?.availabilityStatus || 'Available'}</span>
          </div>
        </motion.div>

        {/* ════════════════ REVIEWS ════════════════ */}
        <motion.div variants={fadeUp} className={`${glass} p-6`}>
          <SectionHeader eyebrow="08 — Feedback" title="Client reviews" />
          {reviews.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.map((review, i) => (
                <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/10 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={review?.clientAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review?.clientName || 'Client')}&background=1e293b&color=cbd5e1`}
                        alt={review?.clientName}
                        className="w-10 h-10 rounded-full border border-white/10 object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{review?.clientName}</p>
                        <p className="text-xs text-slate-500">{review?.projectName}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-500">{formatRelativeTime(review?.createdAt)}</span>
                  </div>
                  <div className="flex gap-1 mt-4">
                    {Array.from({ length: review?.rating || 0 }).map((_, j) => (
                      <Star key={j} size={14} className="fill-amber-300 text-amber-300" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 mt-4 leading-relaxed">{review?.feedback}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="text-center">
                <Star size={30} className="mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">No client reviews yet</p>
                <p className="text-xs text-slate-600 mt-1">Reviews from clients will appear here.</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ════════════════ ANALYTICS ════════════════ */}
        <motion.div variants={fadeUp} className={`${glass} p-6`}>
          <SectionHeader eyebrow="09 — Insights" title="Analytics dashboard" action={<BarChart3 size={16} className="text-slate-600" />} />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Profile views',   value: analytics.views,             icon: Eye },
                { label: 'Completed',       value: analytics.completedProjects,  icon: CheckCircle2 },
                { label: 'Retention',       value: `${analytics.retention}%`,    icon: Users },
                { label: 'Earnings',        value: `$${analytics.earnings}`,     icon: TrendingUp },
              ].map((m, i) => (
                <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/10 p-4">
                  <m.icon size={15} className="text-slate-500" />
                  <p className="text-xl font-bold font-mono mt-3">{m.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{m.label}</p>
                </div>
              ))}

              <div className="col-span-2 sm:col-span-4 rounded-2xl bg-white/[0.02] border border-white/10 p-4">
                <p className="text-xs text-slate-500 mb-3">Profile views — last 7 days</p>
                {weeklyViews ? (
                  <div className="flex items-end gap-2 h-20">
                    {weeklyViews.map((v, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${(v / Math.max(...weeklyViews, 1)) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-blue-500/40 to-cyan-400/70"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 h-20 flex items-center">Weekly breakdown not available yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 flex flex-col items-center justify-center">
              <p className="text-xs text-slate-500 mb-4">Proposal acceptance rate</p>
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r="42"
                    fill="none" stroke="url(#ringGradient)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={acceptanceRingCirc}
                    initial={{ strokeDashoffset: acceptanceRingCirc }}
                    whileInView={{ strokeDashoffset: acceptanceRingCirc * (1 - analytics.acceptanceRate / 100) }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%"   stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#22D3EE" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold font-mono">{analytics.acceptanceRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ════ NOTIFICATIONS + ACTIVITY ════ */}
          <div className="grid xl:grid-cols-2 gap-5 mt-5">
            {/* Notifications — from real Notification collection */}
            <motion.div variants={fadeUp} className={`${glass} p-6`}>
              <SectionHeader eyebrow="10 — Updates" title="Notifications" action={<Bell size={16} className="text-slate-600" />} />
              {profileNotifications.length > 0 ? (
                <div className="space-y-3">
                  {profileNotifications.slice(0, 10).map((n, i) => {
                    const meta = notificationMeta[n?.type] || { icon: Bell, accent: 'text-slate-400' };
                    const Icon = meta.icon;
                    return (
                      <div key={n._id || i} className={`flex items-start gap-3 rounded-xl border p-3.5 transition-colors ${!n?.isRead ? 'bg-blue-500/5 border-blue-500/10' : 'bg-white/[0.02] border-white/5'}`}>
                        <Icon size={16} className={`${meta.accent} mt-0.5 shrink-0`} />
                        <div className="flex-1">
                          {n.title && <p className="text-xs font-semibold text-slate-200">{n.title}</p>}
                          <p className="text-sm text-slate-300 mt-0.5">{n?.message}</p>
                          <p className="text-xs text-slate-600 mt-1">{formatRelativeTime(n?.createdAt)}</p>
                        </div>
                        {!n?.isRead && <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No notifications yet.</p>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={fadeUp} className={`${glass} p-6`}>
              <SectionHeader eyebrow="11 — Feed" title="Recent activity" action={<RefreshCw size={16} className="text-slate-600" />} />
              {activity.length > 0 ? (
                <div className="relative pl-5">
                  <div className="absolute left-[5px] top-1 bottom-1 w-px bg-white/10" />
                  <div className="space-y-5">
                    {activity.slice(0, 10).map((a, i) => (
                      <div key={i} className="relative">
                        <span className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-400" />
                        <p className="text-sm text-slate-300">{a?.text}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{formatRelativeTime(a?.createdAt) || a?.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No recent activity yet.</p>
              )}
            </motion.div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
