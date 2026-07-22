import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllUsersAdmin,
  fetchVerificationQueue,
  approveVerification,
  rejectVerification,
} from '../../store/slices/verificationSlice';
import { BadgeCheck, ShieldX, Users, FileText, Loader2, Search, ChevronDown, ExternalLink, X } from 'lucide-react';

/* ── helpers ── */
const roleBadge = {
  freelancer: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  client:     'bg-violet-500/15 text-violet-300 border-violet-500/20',
  admin:      'bg-amber-500/15 text-amber-300 border-amber-500/20',
};

const statusBadge = {
  active:    'bg-emerald-500/15 text-emerald-300',
  suspended: 'bg-red-500/15 text-red-300',
  inactive:  'bg-slate-500/15 text-slate-400',
};

const verBadge = {
  none:     'bg-slate-500/10 text-slate-500',
  pending:  'bg-amber-500/10 text-amber-400',
  approved: 'bg-emerald-500/10 text-emerald-400',
  rejected: 'bg-red-500/10 text-red-400',
};

const TABS = ['Users', 'Verification Queue'];

/* ── Reject modal ── */
function RejectModal({ request, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-3xl bg-[#0d1a2a] border border-white/10 p-7 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-200">Reject Verification</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <p className="text-sm text-slate-400 mb-3">
          Provide a reason for rejecting <span className="text-slate-200 font-semibold">{request?.user?.fullName}</span>'s request.
        </p>
        <textarea
          rows={3}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Document is blurry or unreadable"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-red-400/40 resize-none placeholder:text-slate-600"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={() => onConfirm(reason)} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 font-semibold text-sm hover:bg-red-500/25 transition-colors disabled:opacity-50">
            {loading ? 'Rejecting…' : 'Confirm Reject'}
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm hover:bg-white/10 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ManageUsers() {
  const dispatch     = useDispatch();
  const { allUsers, queue, loading, actionLoading } = useSelector(s => s.verification);

  const [tab,           setTab]           = useState(0);
  const [search,        setSearch]        = useState('');
  const [roleFilter,    setRoleFilter]    = useState('all');
  const [rejectTarget,  setRejectTarget]  = useState(null);   // { _id, user: { fullName } }

  useEffect(() => {
    dispatch(fetchAllUsersAdmin());
    dispatch(fetchVerificationQueue({ status: 'pending' }));
  }, [dispatch]);

  const filtered = allUsers.filter(u => {
    const matchSearch = u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                        u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleApprove = (reqId) => {
    dispatch(approveVerification(reqId));
  };

  const handleReject = (reason) => {
    if (!rejectTarget) return;
    dispatch(rejectVerification({ requestId: rejectTarget._id, reason }));
    setRejectTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-200">Manage Users</h2>
          <p className="text-sm text-slate-500 mt-1">
            {allUsers.length} total users · {queue.length} pending verifications
          </p>
        </div>
        <div className="flex gap-1 bg-white/[0.03] border border-white/10 rounded-2xl p-1">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === i ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}>
              {t}
              {i === 1 && queue.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black">
                  {queue.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 0: USER LIST ── */}
      {tab === 0 && (
        <div className="rounded-3xl bg-white/[0.03] border border-white/10 overflow-hidden">
          {/* Filters */}
          <div className="p-5 border-b border-white/10 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-cyan-400/40 placeholder:text-slate-600" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none bg-[#0d1a2a]">
              <option value="all">All roles</option>
              <option value="freelancer">Freelancer</option>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
              <Loader2 size={18} className="animate-spin" /> Loading users…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Verified</th>
                    <th className="px-6 py-4">Verification</th>
                    <th className="px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(u => (
                    <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${u.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || 'U')}&background=0f172a&color=22d3ee`}
                            alt={u.fullName}
                            className="w-9 h-9 rounded-xl object-cover border border-white/10"
                          />
                          <div>
                            <p className="font-semibold text-slate-200 flex items-center gap-1">
                              {u.fullName}
                              {u.isIdentityVerified && <BadgeCheck size={13} className="text-cyan-400" />}
                            </p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full border ${roleBadge[u.role] || ''}`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusBadge[u.status] || statusBadge.active}`}>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {u.isIdentityVerified ? (
                          <span className="text-emerald-400 flex items-center gap-1"><BadgeCheck size={13} /> Verified</span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {u.role === 'freelancer' && (
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${verBadge[u.verificationStatus] || verBadge.none}`}>
                            {u.verificationStatus || 'none'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-sm">No users found.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 1: VERIFICATION QUEUE ── */}
      {tab === 1 && (
        <div className="rounded-3xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <p className="text-sm text-slate-400">
              {queue.length} pending verification request{queue.length !== 1 ? 's' : ''} awaiting review.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
              <Loader2 size={18} className="animate-spin" /> Loading queue…
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-16">
              <BadgeCheck size={36} className="mx-auto text-emerald-500 mb-3" />
              <p className="text-slate-400 font-semibold">All clear!</p>
              <p className="text-sm text-slate-600 mt-1">No pending verification requests.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {queue.map(req => (
                <div key={req._id} className="p-5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.user?.avatar ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${req.user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user?.fullName || 'U')}&background=0f172a&color=22d3ee`}
                        alt={req.user?.fullName}
                        className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                      />
                      <div>
                        <p className="font-semibold text-slate-200">{req.user?.fullName}</p>
                        <p className="text-xs text-slate-500">{req.user?.email}</p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Submitted {new Date(req.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(req._id)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/25 transition-colors disabled:opacity-50">
                        <BadgeCheck size={14} /> Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget(req)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50">
                        <ShieldX size={14} /> Reject
                      </button>
                    </div>
                  </div>

                  {/* Documents */}
                  {req.documents?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {req.documents.map((doc, i) => (
                        <a key={i}
                          href={doc.url?.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${doc.url}` : doc.url}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white hover:border-white/20 transition-colors">
                          <FileText size={11} />
                          {doc.label || `Document ${i + 1}`}
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          request={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
