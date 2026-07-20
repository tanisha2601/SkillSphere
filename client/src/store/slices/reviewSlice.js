import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import {
  createReview as createReviewService,
  getMyReviews as getMyReviewsService,
  getFreelancerReviews as getFreelancerReviewsService,
} from "../../services/reviewService";

/* ==========================================================
   Async Thunks
========================================================== */

export const submitReview = createAsyncThunk(
  "review/submitReview",
  async (reviewData, { rejectWithValue }) => {
    try {
      const data = await createReviewService(reviewData);

      return data;
    } catch (error) {

      return rejectWithValue(
        error?.message || "Something went wrong"
      );
    }
  }
);

export const getMyReviews = createAsyncThunk(
  "review/getMyReviews",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyReviewsService();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getFreelancerReviews = createAsyncThunk(
  "review/getFreelancerReviews",
  async (freelancerId, { rejectWithValue }) => {
    try {
      return await getFreelancerReviewsService(freelancerId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/* ==========================================================
   Initial State
========================================================== */

const initialState = {
  reviews: [], // Can hold freelancer reviews or my reviews based on context
  loading: false,
  actionLoading: false,
  success: false,
  error: null,
};

/* ==========================================================
   Slice
========================================================== */

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
    clearReviewSuccess: (state) => {
      state.success = false;
    },
    clearReviews: (state) => {
      state.reviews = [];
    }
  },
  extraReducers: (builder) => {
    builder
      /* ---- submitReview ---- */
      .addCase(submitReview.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        if (action.payload?.review) {
          state.reviews.unshift(action.payload.review);
        }
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      /* ---- getMyReviews ---- */
      .addCase(getMyReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyReviews.fulfilled, (state, action) => {
        state.loading = false;
       state.reviews = action.payload?.reviews || [];
      })
      .addCase(getMyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---- getFreelancerReviews ---- */
      .addCase(getFreelancerReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFreelancerReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
      })
      .addCase(getFreelancerReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviewError, clearReviewSuccess, clearReviews } = reviewSlice.actions;

export default reviewSlice.reducer;
