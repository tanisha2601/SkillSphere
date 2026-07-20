import api from "./api";

const BASE = "/verification";

/* ── Freelancer ─────────────────────────────────────────── */
export const getMyVerificationStatus = () =>
  api.get(`${BASE}/my-status`);

export const submitVerificationRequest = (formData) =>
  api.post(`${BASE}/request`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/* ── Admin ──────────────────────────────────────────────── */
export const getPendingRequests = (status = "pending", page = 1) =>
  api.get(`${BASE}/queue`, { params: { status, page } });

export const getAllUsersWithVerification = () =>
  api.get(`${BASE}/users`);

export const approveVerification = (requestId) =>
  api.patch(`${BASE}/${requestId}/approve`);

export const rejectVerification = (requestId, reason) =>
  api.patch(`${BASE}/${requestId}/reject`, { reason });
