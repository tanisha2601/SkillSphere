import api from "./api";

/**
 * Submit Proposal
 */
export const createProposal = async (gigId, proposalData) => {
  return await api.post(`/proposals/${gigId}`, proposalData);
};

/**
 * Get Logged-in Freelancer Proposals
 */
export const getMyProposals = async () => {
  return await api.get("/proposals/my-proposals");
};

/**
 * Get Proposals for a Gig (Client)
 */
export const getGigProposals = async (gigId) => {
  return await api.get(`/proposals/gig/${gigId}`);
};

/**
 * Accept Proposal
 */
export const acceptProposal = async (proposalId) => {
  return await api.patch(`/proposals/accept/${proposalId}`);
};

/**
 * Reject Proposal
 */
export const rejectProposal = async (proposalId) => {
  return await api.patch(`/proposals/reject/${proposalId}`);
};

/**
 * Withdraw Proposal
 */
export const withdrawProposal = async (proposalId) => {
  return await api.patch(`/proposals/withdraw/${proposalId}`);
};