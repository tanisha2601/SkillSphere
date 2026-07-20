import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import * as adminService from "../../services/adminService";

export const getAdminStats = createAsyncThunk(
  "admin/getStats",
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getAdminStats();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "admin/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getAllUsers();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const suspendUser = createAsyncThunk(
  "admin/suspendUser",
  async (userId, { rejectWithValue }) => {
    try {
      const data = await adminService.suspendUser(userId);
      toast.success("User suspended");
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to suspend user");
      return rejectWithValue(error.message);
    }
  }
);

export const activateUser = createAsyncThunk(
  "admin/activateUser",
  async (userId, { rejectWithValue }) => {
    try {
      const data = await adminService.activateUser(userId);
      toast.success("User activated");
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to activate user");
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  stats: {
    totalUsers: 0,
    totalFreelancers: 0,
    totalClients: 0,
    totalGigs: 0,
    totalRevenue: 0,
  },
  users: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload?.stats ?? state.stats;
      })
      .addCase(getAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = Array.isArray(action.payload?.users)
          ? action.payload.users
          : [];
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(suspendUser.fulfilled, (state, action) => {
        const updated = action.payload?.user;
        if (!updated) return;
        state.users = state.users.map((u) =>
          u._id === updated._id ? updated : u
        );
      })

      .addCase(activateUser.fulfilled, (state, action) => {
        const updated = action.payload?.user;
        if (!updated) return;
        state.users = state.users.map((u) =>
          u._id === updated._id ? updated : u
        );
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;