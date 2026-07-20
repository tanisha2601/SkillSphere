import api from "./api";

/**
 * Client: Submit a review for a completed contract
 */
export const createReview = async (reviewData) => {
  return await api.post("/reviews", reviewData);
};

/**
 * Client: Get all reviews written by the logged-in client
 */
export const getMyReviews = async () => {
  return await api.get("/reviews/my-reviews");
};

/**
 * Public/Any: Get reviews for a specific freelancer
 */
export const getFreelancerReviews = async (freelancerId) => {
  return await api.get(`/reviews/freelancer/${freelancerId}`);
};
