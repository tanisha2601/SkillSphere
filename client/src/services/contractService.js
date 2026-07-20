import api from "./api";

/**
 * Client: Get all contracts
 */
export const getClientContracts = async () => {
  return await api.get("/contracts/client");
};

/**
 * Freelancer: Get all contracts
 */
export const getFreelancerContracts = async () => {
  return await api.get("/contracts/freelancer");
};

/**
 * Get a single contract by ID
 */
export const getContractById = async (contractId) => {
  return await api.get(`/contracts/${contractId}`);
};

/**
 * Freelancer: Submit work
 */
export const submitWork = async (contractId) => {
  return await api.patch(`/contracts/submit/${contractId}`);
};

/**
 * Client: Approve work
 */
export const approveWork = async (contractId) => {
  return await api.patch(`/contracts/approve/${contractId}`);
};


/**
 * Freelancer: Update progress
 */
export const updateProgress =
  async (
    contractId,
    progress
  ) => {
    return await api.patch(
      `/contracts/progress/${contractId}`,
      {
        progress,
      }
    );
  };