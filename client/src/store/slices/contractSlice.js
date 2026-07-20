import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import {
  getClientContracts as getClientContractsService,
  getFreelancerContracts as getFreelancerContractsService,
  getContractById as getContractByIdService,
  submitWork as submitWorkService,
  approveWork as approveWorkService,
  updateProgress as updateProgressService,
} from "../../services/contractService";

import {
  addMilestone as addMilestoneService,
  updateMilestone as updateMilestoneService,
  deleteMilestone as deleteMilestoneService,
  completeMilestone as completeMilestoneService,
  releaseMilestonePayment as releaseMilestonePaymentService,
  addProgressLog as addProgressLogService,
  getProgressLog as getProgressLogService,
  getDeadlineInfo as getDeadlineInfoService,
} from "../../services/milestoneService";

/* ==========================================================
   Async Thunks
========================================================== */

export const getClientContracts = createAsyncThunk(
  "contract/getClientContracts",
  async (_, { rejectWithValue }) => {
    try {
      return await getClientContractsService();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getFreelancerContracts = createAsyncThunk(
  "contract/getFreelancerContracts",
  async (_, { rejectWithValue }) => {
    try {
      return await getFreelancerContractsService();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getContractById = createAsyncThunk(
  "contract/getContractById",
  async (contractId, { rejectWithValue }) => {
    try {
      return await getContractByIdService(contractId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitWork = createAsyncThunk(
  "contract/submitWork",
  async (contractId, { rejectWithValue }) => {
    try {
      const data = await submitWorkService(contractId);
      toast.success("Work submitted successfully!");
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to submit work.");
      return rejectWithValue(error.message);
    }
  }
);

export const approveWork = createAsyncThunk(
  "contract/approveWork",
  async (contractId, { rejectWithValue }) => {
    try {
      const data = await approveWorkService(contractId);
      toast.success("Work approved! Contract completed.");
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to approve work.");
      return rejectWithValue(error.message);
    }
  }
);

export const updateProgress =
  createAsyncThunk(
    "contract/updateProgress",
    async (
      { contractId, progress },
      { rejectWithValue }
    ) => {
      try {
        const data =
          await updateProgressService(
            contractId,
            progress
          );

        return data;
      } catch (error) {
        return rejectWithValue(
          error.message
        );
      }
    }
  );

/* ─── Milestone Thunks ──────────────────────────────────────────── */
export const addMilestone = createAsyncThunk(
  "contract/addMilestone",
  async ({ contractId, data }, { rejectWithValue }) => {
    try {
      const res = await addMilestoneService(contractId, data);
      toast.success("Milestone added!");
      return { contractId, milestones: res.milestones, progress: res.progress };
    } catch (e) {
      toast.error(e.message || "Failed to add milestone");
      return rejectWithValue(e.message);
    }
  }
);

export const updateMilestone = createAsyncThunk(
  "contract/updateMilestone",
  async ({ contractId, mId, data }, { rejectWithValue }) => {
    try {
      const res = await updateMilestoneService(contractId, mId, data);
      return { contractId, milestones: res.milestones };
    } catch (e) {
      toast.error(e.message || "Failed to update milestone");
      return rejectWithValue(e.message);
    }
  }
);

export const deleteMilestone = createAsyncThunk(
  "contract/deleteMilestone",
  async ({ contractId, mId }, { rejectWithValue }) => {
    try {
      const res = await deleteMilestoneService(contractId, mId);
      toast.success("Milestone removed");
      return { contractId, milestones: res.milestones, progress: res.progress };
    } catch (e) {
      toast.error(e.message || "Failed to delete milestone");
      return rejectWithValue(e.message);
    }
  }
);

export const completeMilestone = createAsyncThunk(
  "contract/completeMilestone",
  async ({ contractId, mId }, { rejectWithValue }) => {
    try {
      const res = await completeMilestoneService(contractId, mId);
      toast.success("Milestone completed!");
      return { contractId, contract: res.contract };
    } catch (e) {
      toast.error(e.message || "Failed to complete milestone");
      return rejectWithValue(e.message);
    }
  }
);

export const releaseMilestonePayment = createAsyncThunk(
  "contract/releaseMilestonePayment",
  async ({ contractId, mId }, { rejectWithValue }) => {
    try {
      const res = await releaseMilestonePaymentService(contractId, mId);
      toast.success("Payment released!");
      return { contractId, milestones: res.milestones };
    } catch (e) {
      toast.error(e.message || "Failed to release payment");
      return rejectWithValue(e.message);
    }
  }
);

export const addProgressLog = createAsyncThunk(
  "contract/addProgressLog",
  async ({ contractId, note, progress }, { rejectWithValue }) => {
    try {
      const res = await addProgressLogService(contractId, note, progress);
      toast.success("Progress update posted!");
      return { contractId, progressLogs: res.progressLogs, progress: res.progress };
    } catch (e) {
      toast.error(e.message || "Failed to post update");
      return rejectWithValue(e.message);
    }
  }
);

export const fetchProgressLog = createAsyncThunk(
  "contract/fetchProgressLog",
  async (contractId, { rejectWithValue }) => {
    try {
      const res = await getProgressLogService(contractId);
      return { contractId, progressLogs: res.progressLogs };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchDeadlineInfo = createAsyncThunk(
  "contract/fetchDeadlineInfo",
  async (contractId, { rejectWithValue }) => {
    try {
      const res = await getDeadlineInfoService(contractId);
      return res;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

/* ==========================================================
   Initial State
========================================================== */

const initialState = {
  contracts: [],
  selectedContract: null,
  progressLogs: [],
  deadlineInfo: null,
  loading: false,
  detailLoading: false,
  actionLoading: false,
  success: false,
  error: null,
};

/* ==========================================================
   Slice
========================================================== */

const contractSlice = createSlice({
  name: "contract",
  initialState,

  reducers: {
    clearContractError: (state) => {
      state.error = null;
    },
    clearContractSuccess: (state) => {
      state.success = false;
    },
    clearSelectedContract: (state) => {
      state.selectedContract = null;
    },
  },

  extraReducers: (builder) => {
    builder

    /* ---- updateProgress ---- */

.addCase(
  updateProgress.pending,
  (state) => {
    state.actionLoading =
      true;
  }
)

.addCase(
  updateProgress.fulfilled,
  (
    state,
    action
  ) => {
    state.actionLoading =
      false;

    const updated =
      action.payload.contract;

    state.contracts =
      state.contracts.map(
        (c) =>
          c._id ===
          updated._id
            ? updated
            : c
      );

    if (
      state.selectedContract
        ?._id ===
      updated._id
    ) {
      state.selectedContract =
        updated;
    }
  }
)

.addCase(
  updateProgress.rejected,
  (
    state,
    action
  ) => {
    state.actionLoading =
      false;

    state.error =
      action.payload;
  }
)

      /* ---- getClientContracts ---- */
      .addCase(getClientContracts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getClientContracts.fulfilled, (state, action) => {
        state.loading = false;
        state.contracts = action.payload.contracts;
      })
      .addCase(getClientContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---- getFreelancerContracts ---- */
      .addCase(getFreelancerContracts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFreelancerContracts.fulfilled, (state, action) => {
        state.loading = false;
        state.contracts = action.payload.contracts;
      })
      .addCase(getFreelancerContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---- getContractById ---- */
      .addCase(getContractById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(getContractById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedContract = action.payload.contract;
      })
      .addCase(getContractById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      /* ---- submitWork ---- */
      .addCase(submitWork.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(submitWork.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const updated = action.payload.contract;
        state.contracts = state.contracts.map((c) =>
          c._id === updated._id ? updated : c
        );
        if (state.selectedContract?._id === updated._id) {
          state.selectedContract = updated;
        }
      })
      .addCase(submitWork.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      /* ---- approveWork ---- */
      .addCase(approveWork.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(approveWork.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const updated = action.payload.contract;
        state.contracts = state.contracts.map((c) =>
          c._id === updated._id ? updated : c
        );
        if (state.selectedContract?._id === updated._id) {
          state.selectedContract = updated;
        }
      })
      .addCase(approveWork.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      /* ─── Milestone reducers ─── */

      // helper to patch milestones on selectedContract
      .addCase(addMilestone.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { milestones, progress } = action.payload;
        if (state.selectedContract) {
          state.selectedContract.milestones = milestones;
          state.selectedContract.progress   = progress ?? state.selectedContract.progress;
        }
      })
      .addCase(updateMilestone.fulfilled, (state, action) => {
        if (state.selectedContract) {
          state.selectedContract.milestones = action.payload.milestones;
        }
      })
      .addCase(deleteMilestone.fulfilled, (state, action) => {
        const { milestones, progress } = action.payload;
        if (state.selectedContract) {
          state.selectedContract.milestones = milestones;
          state.selectedContract.progress   = progress ?? state.selectedContract.progress;
        }
      })
      .addCase(completeMilestone.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload.contract;
        if (updated) {
          state.selectedContract = updated;
          state.contracts = state.contracts.map(c => c._id === updated._id ? updated : c);
        }
      })
      .addCase(releaseMilestonePayment.fulfilled, (state, action) => {
        if (state.selectedContract) {
          state.selectedContract.milestones = action.payload.milestones;
        }
      })
      .addCase(addProgressLog.fulfilled, (state, action) => {
        const { progressLogs, progress } = action.payload;
        state.progressLogs = progressLogs ?? state.progressLogs;
        if (state.selectedContract) {
          state.selectedContract.progressLogs = progressLogs;
          state.selectedContract.progress = progress ?? state.selectedContract.progress;
        }
      })
      .addCase(fetchProgressLog.fulfilled, (state, action) => {
        state.progressLogs = action.payload.progressLogs ?? [];
      })
      .addCase(fetchDeadlineInfo.fulfilled, (state, action) => {
        state.deadlineInfo = action.payload;
      })

      // Generic action loading flags for milestone ops
      .addCase(addMilestone.pending,          (state) => { state.actionLoading = true; state.error = null; })
      .addCase(addMilestone.rejected,         (state, action) => { state.actionLoading = false; state.error = action.payload; })
      .addCase(completeMilestone.pending,     (state) => { state.actionLoading = true; state.error = null; })
      .addCase(completeMilestone.rejected,    (state, action) => { state.actionLoading = false; state.error = action.payload; });
  },
});

export const {
  clearContractError,
  clearContractSuccess,
  clearSelectedContract,
} = contractSlice.actions;

export default contractSlice.reducer;