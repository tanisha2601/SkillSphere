import api from "./api";

const BASE = (contractId) => `/contracts/${contractId}/milestones`;

/* ─── Milestone CRUD ─────────────────────────────────────────── */
export const addMilestone         = (contractId, data)       => api.post(BASE(contractId), data);
export const updateMilestone      = (contractId, mId, data)  => api.put(`${BASE(contractId)}/${mId}`, data);
export const deleteMilestone      = (contractId, mId)        => api.delete(`${BASE(contractId)}/${mId}`);
export const completeMilestone    = (contractId, mId)        => api.patch(`${BASE(contractId)}/${mId}/complete`);
export const releaseMilestonePayment = (contractId, mId)     => api.patch(`${BASE(contractId)}/${mId}/release`);

/* ─── Progress Log ───────────────────────────────────────────── */
export const getProgressLog  = (contractId)                  => api.get(`${BASE(contractId)}/progress-log`);
export const addProgressLog  = (contractId, note, progress)  => api.post(`${BASE(contractId)}/progress-log`, { note, progress });

/* ─── Deadline ───────────────────────────────────────────────── */
export const getDeadlineInfo = (contractId)                  => api.get(`${BASE(contractId)}/deadline`);
