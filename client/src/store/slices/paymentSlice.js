import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import * as paymentService from "../../services/paymentService";

/* ==========================================================
   Async Thunks
========================================================== */

export const createRazorpayOrder = createAsyncThunk(
  "payment/createOrder",
  async (contractId, { rejectWithValue }) => {
    try {
      const data = await paymentService.createOrder(contractId);
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to initiate payment");
      return rejectWithValue(error.message);
    }
  }
);

export const verifyPayment = createAsyncThunk(
  "payment/verifyPayment",
  async (verificationData, { rejectWithValue }) => {
    try {
      const data = await paymentService.verifyPayment(verificationData);
      toast.success("Payment successful!");
      return data;
    } catch (error) {
      toast.error(error.message || "Payment verification failed");
      return rejectWithValue(error.message);
    }
  }
);

export const getWalletData = createAsyncThunk(
  "payment/getWalletData",
  async (_, { rejectWithValue }) => {
    try {
      return await paymentService.getWallet();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getClientPaymentHistory = createAsyncThunk(
  "payment/getPaymentHistory",
  async (_, { rejectWithValue }) => {
    try {
      return await paymentService.getPaymentHistory();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/* ==========================================================
   Initial State
========================================================== */

const initialState = {
  currentOrder: null,
  walletBalance: 0,
  totalEarnings: 0,
  transactions: [],
  payments: [],
  loading: false,
  paymentLoading: false,
  success: false,
  error: null,
};

/* ==========================================================
   Slice
========================================================== */

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearPaymentSuccess: (state) => {
      state.success = false;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---- createRazorpayOrder ---- */
      .addCase(createRazorpayOrder.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.currentOrder = action.payload ?? null;
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      })

      /* ---- verifyPayment ---- */
      .addCase(verifyPayment.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.paymentLoading = false;
        state.success = true;
        state.currentOrder = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      })

      /* ---- getWalletData ---- */
      .addCase(getWalletData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWalletData.fulfilled, (state, action) => {
        state.loading = false;
        // Normalize in case the API response shape ever drifts
        state.walletBalance = action.payload?.balance ?? 0;
        state.totalEarnings = action.payload?.totalEarnings ?? 0;
        state.transactions = Array.isArray(action.payload?.transactions)
          ? action.payload.transactions
          : [];
      })
      .addCase(getWalletData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Don't leave stale/undefined data behind on failure
        state.transactions = state.transactions ?? [];
      })

      /* ---- getClientPaymentHistory ---- */
      .addCase(getClientPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getClientPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = Array.isArray(action.payload?.payments)
          ? action.payload.payments
          : [];
      })
      .addCase(getClientPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.payments = state.payments ?? [];
      });
  },
});

export const { clearPaymentError, clearPaymentSuccess, clearCurrentOrder } = paymentSlice.actions;

export default paymentSlice.reducer;