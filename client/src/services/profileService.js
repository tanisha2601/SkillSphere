/**
 * profileService.js
 *
 * All profile-related API calls, using the shared `api` instance
 * (which handles auth token injection + error normalisation via interceptors).
 */

import api from "./api";

const BASE = "/users";

/* --------------------------------------------------------
   Core profile
-------------------------------------------------------- */

export const getProfile = () =>
  api.get(`${BASE}/profile`);

export const updateProfile = (data) =>
  api.put(`${BASE}/profile`, data);

export const getProfileStats = () =>
  api.get(`${BASE}/profile/stats`);

/* --------------------------------------------------------
   File uploads  (multipart/form-data — pass a FormData object)
-------------------------------------------------------- */

export const uploadAvatar = (formData) =>
  api.post(`${BASE}/profile/avatar`, formData);

export const uploadResume = (formData) =>
  api.post(`${BASE}/profile/resume`, formData);

/* --------------------------------------------------------
   Portfolio projects
-------------------------------------------------------- */

export const addPortfolioProject = (data) =>
  api.post(`${BASE}/profile/portfolio`, data);

export const updatePortfolioProject = (projectId, data) =>
  api.put(`${BASE}/profile/portfolio/${projectId}`, data);

export const deletePortfolioProject = (projectId) =>
  api.delete(`${BASE}/profile/portfolio/${projectId}`);

/* --------------------------------------------------------
   Certifications
-------------------------------------------------------- */

export const addCertification = (data) =>
  api.post(`${BASE}/profile/certifications`, data);

export const updateCertification = (certId, data) =>
  api.put(`${BASE}/profile/certifications/${certId}`, data);

export const deleteCertification = (certId) =>
  api.delete(`${BASE}/profile/certifications/${certId}`);

/* --------------------------------------------------------
   Work experience
-------------------------------------------------------- */

export const addWorkExperience = (data) =>
  api.post(`${BASE}/profile/work-experience`, data);

export const updateWorkExperience = (itemId, data) =>
  api.put(`${BASE}/profile/work-experience/${itemId}`, data);

export const deleteWorkExperience = (itemId) =>
  api.delete(`${BASE}/profile/work-experience/${itemId}`);

/* --------------------------------------------------------
   Activity feed
-------------------------------------------------------- */

export const getActivityFeed = () =>
  api.get(`${BASE}/profile/activity`);

export const addActivityEntry = (text) =>
  api.post(`${BASE}/profile/activity`, { text });

/* --------------------------------------------------------
   Analytics
-------------------------------------------------------- */

export const trackProfileView = (userId) =>
  userId
    ? api.post(`${BASE}/profile/view/${userId}`)
    : api.post(`${BASE}/profile/view`);
