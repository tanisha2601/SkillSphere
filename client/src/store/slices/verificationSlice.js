import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import {
  getMyVerificationStatus as getMyStatusService,
  submitVerificationRequest as submitService,
  getPendingRequests as getPendingService,
  getAllUsersWithVerification as getAllUsersService,
  approveVerification as approveService,
  rejectVerification as rejectService,
} from "../../services/verificationService";

/* ==========================================================
   Async Thunks
========================================================== */

export const fetchMyVerificationStatus = createAsyncThunk(
  "verification/fetchMyStatus",
  async (_, { rejectWithValue }) => {
    try { return await getMyStatusService(); }
    catch (e) { return rejectWithValue(e.message); }
  }
);

export const submitVerificationRequest = createAsyncThunk(
  "verification/submit",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await submitService(formData);
      toast.success("Verification request submitted!");
      return res;
    } catch (e) {
      toast.error(e.message || "Failed to submit request");
      return rejectWithValue(e.message);
    }
  }
);

export const fetchVerificationQueue = createAsyncThunk(
  "verification/fetchQueue",
  async ({ status = "pending", page = 1 } = {}, { rejectWithValue }) => {
    try { return await getPendingService(status, page); }
    catch (e) { return rejectWithValue(e.message); }
  }
);

export const fetchAllUsersAdmin = createAsyncThunk(
  "verification/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try { return await getAllUsersService(); }
    catch (e) { return rejectWithValue(e.message); }
  }
);

export const approveVerification = createAsyncThunk(
  "verification/approve",
  async (requestId, { rejectWithValue }) => {
    try {
      const res = await approveService(requestId);
      toast.success("Verification approved!");
      return res;
    } catch (e) {
      toast.error(e.message || "Failed to approve");
      return rejectWithValue(e.message);
    }
  }
);

export const rejectVerification = createAsyncThunk(
  "verification/reject",
  async ({ requestId, reason }, { rejectWithValue }) => {
    try {
      const res = await rejectService(requestId, reason);
      toast.success("Verification rejected");
      return res;
    } catch (e) {
      toast.error(e.message || "Failed to reject");
      return rejectWithValue(e.message);
    }
  }
);

/* ==========================================================
   Slice
========================================================== */

const verificationSlice = createSlice({
  name: "verification",
  initialState: {
    myStatus:     null,   // { request, isVerified, isIdentityVerified }
    queue:        [],     // pending requests for admin
    allUsers:     [],     // enriched user list for admin manage-users page
    loading:      false,
    actionLoading:false,
    error:        null,
  },

  reducers: {
    clearVerificationError: (state) => { state.error = null; },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMyVerificationStatus.pending,  (state) => { state.loading = true; })
      .addCase(fetchMyVerificationStatus.fulfilled, (state, action) => {
        state.loading  = false;
        state.myStatus = action.payload;
      })
      .addCase(fetchMyVerificationStatus.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      .addCase(submitVerificationRequest.pending,  (state) => { state.actionLoading = true; })
      .addCase(submitVerificationRequest.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.myStatus) state.myStatus.request = action.payload?.request;
      })
      .addCase(submitVerificationRequest.rejected,  (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchVerificationQueue.pending,  (state) => { state.loading = true; })
      .addCase(fetchVerificationQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.queue   = action.payload?.requests ?? [];
      })
      .addCase(fetchVerificationQueue.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      .addCase(fetchAllUsersAdmin.pending,  (state) => { state.loading = true; })
      .addCase(fetchAllUsersAdmin.fulfilled, (state, action) => {
        state.loading  = false;
        state.allUsers = action.payload?.users ?? [];
      })
      .addCase(fetchAllUsersAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      .addCase(approveVerification.pending,  (state) => { state.actionLoading = true; })
      .addCase(approveVerification.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload?.request;
        if (updated) {
          state.queue = state.queue.filter(r => r._id !== updated._id);
        }
      })
      .addCase(approveVerification.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(rejectVerification.pending,  (state) => { state.actionLoading = true; })
      .addCase(rejectVerification.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload?.request;
        if (updated) {
          state.queue = state.queue.filter(r => r._id !== updated._id);
        }
      })
      .addCase(rejectVerification.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearVerificationError } = verificationSlice.actions;
export default verificationSlice.reducer;
