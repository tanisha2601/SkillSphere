import api from './api';

// ============================================================
// Gig Service — All calls proxy through the configured
// Axios instance (api.js) which auto-attaches the JWT token
// and normalises error responses.
// ============================================================

/**
 * POST /api/gigs
 * Create a new gig. Protected — client role only.
 * @param {Object} gigData - { title, description, category, budget, skills, deliveryTime }
 */
export const createGig = async (gigData) => {
  return await api.post('/gigs', gigData);
};

/**
 * GET /api/gigs
 * Fetch all gigs. Public route.
 * @param {Object} params - Optional query params: { page, limit, search, category, minBudget, maxBudget, skills }
 */
export const getAllGigs = async (params = {}) => {
  return await api.get('/gigs', { params });
};

/**
 * GET /api/gigs/my-gigs
 * Fetch the logged-in client's own gigs — ANY status (open, in-progress,
 * completed, cancelled). Protected — client role only.
 */
export const getMyGigs = async () => {
  return await api.get('/gigs/my-gigs');
};

/**
 * GET /api/gigs/:id
 * Fetch a single gig by its MongoDB ObjectId. Public route.
 * @param {string} id - Gig document _id
 */
export const getGigById = async (id) => {
  return await api.get(`/gigs/${id}`);
};

/**
 * PUT /api/gigs/:id
 * Update an existing gig. Protected — client (owner) only.
 * @param {string} id      - Gig document _id
 * @param {Object} gigData - Fields to update
 */
export const updateGig = async (id, gigData) => {
  return await api.put(`/gigs/${id}`, gigData);
};

/**
 * DELETE /api/gigs/:id
 * Delete a gig. Protected — client (owner) only.
 * @param {string} id - Gig document _id
 */
export const deleteGig = async (id) => {
  return await api.delete(`/gigs/${id}`);
};

/**
 * GET /api/gigs/recommended
 * Fetch AI recommended gigs for freelancer
 */
export const getRecommendedGigs = async () => {
  return await api.get(
    "/gigs/recommended"
  );
};