import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import {
  createProposal as createProposalService,
  getMyProposals as getMyProposalsService,
  getGigProposals as getGigProposalsService,
  acceptProposal as acceptProposalService,
  rejectProposal as rejectProposalService,
  withdrawProposal as withdrawProposalService,
} from "../../services/proposalService";

/* ==========================================================
   Async Thunks
========================================================== */

export const createProposal = createAsyncThunk(
  "proposal/createProposal",
  async ({ gigId, proposalData }, { rejectWithValue }) => {
    try {
      const data = await createProposalService(gigId, proposalData);
      toast.success("Proposal submitted successfully!");
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to submit proposal.");
      return rejectWithValue(error.message);
    }
  }
);

export const getMyProposals = createAsyncThunk(
  "proposal/getMyProposals",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyProposalsService();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getGigProposals = createAsyncThunk(
  "proposal/getGigProposals",
  async (gigId, { rejectWithValue }) => {
    try {
      return await getGigProposalsService(gigId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptProposal = createAsyncThunk(
  "proposal/acceptProposal",
  async (proposalId, { rejectWithValue }) => {
    try {
      const data = await acceptProposalService(proposalId);
      toast.success("Proposal accepted! Contract created.");
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to accept proposal.");
      return rejectWithValue(error.message);
    }
  }
);

export const rejectProposal = createAsyncThunk(
  "proposal/rejectProposal",
  async (proposalId, { rejectWithValue }) => {
    try {
      const data = await rejectProposalService(proposalId);
      toast.success("Proposal rejected.");
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to reject proposal.");
      return rejectWithValue(error.message);
    }
  }
);

export const withdrawProposal = createAsyncThunk(
  "proposal/withdrawProposal",
  async (proposalId, { rejectWithValue }) => {
    try {
      const data = await withdrawProposalService(proposalId);
      toast.success("Proposal withdrawn.");
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to withdraw proposal.");
      return rejectWithValue(error.message);
    }
  }
);

/* ==========================================================
   Initial State
========================================================== */

const initialState = {
  proposals: [],
  loading: false,
  actionLoading: false,
  success: false,
  error: null,
};

/* ==========================================================
   Slice
========================================================== */

const proposalSlice = createSlice({
  name: "proposal",
  initialState,

  reducers: {
    clearProposalError: (state) => {
      state.error = null;
    },
    clearProposalSuccess: (state) => {
      state.success = false;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---- createProposal ---- */
      .addCase(createProposal.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProposal.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.proposals.unshift(action.payload.proposal);
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      /* ---- getMyProposals ---- */
      .addCase(getMyProposals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyProposals.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals = action.payload.proposals;
      })
      .addCase(getMyProposals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---- getGigProposals ---- */
      .addCase(getGigProposals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGigProposals.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals = action.payload.proposals;
      })
      .addCase(getGigProposals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---- acceptProposal ---- */
      .addCase(acceptProposal.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(acceptProposal.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const updatedProposal = action.payload.proposal;
        state.proposals = state.proposals.map((p) =>
          p._id === updatedProposal._id ? updatedProposal : p
        );
      })
      .addCase(acceptProposal.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      /* ---- rejectProposal ---- */
      .addCase(rejectProposal.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(rejectProposal.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const updatedProposal = action.payload.proposal;
        state.proposals = state.proposals.map((p) =>
          p._id === updatedProposal._id ? updatedProposal : p
        );
      })
      .addCase(rejectProposal.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      /* ---- withdrawProposal ---- */
      .addCase(withdrawProposal.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(withdrawProposal.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const updatedProposal = action.payload.proposal;
        state.proposals = state.proposals.map((p) =>
          p._id === updatedProposal._id ? updatedProposal : p
        );
      })
      .addCase(withdrawProposal.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProposalError, clearProposalSuccess } = proposalSlice.actions;
export default proposalSlice.reducer;