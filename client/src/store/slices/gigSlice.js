import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  createGig as createGigService,
  getAllGigs as getAllGigsService,
  getMyGigs as getMyGigsService,
  getGigById as getGigByIdService,
  updateGig as updateGigService,
  deleteGig as deleteGigService,
  getRecommendedGigs as getRecommendedGigsService,
} from "../../services/gigService";




// ============================================================
// Async Thunks
// ============================================================

/**
 * Create a new gig (client only)
 */
export const createGig = createAsyncThunk(
  'gig/createGig',
  async (gigData, { rejectWithValue }) => {
    try {
      const response = await createGigService(gigData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create gig');
    }
  }
);

/**
 * Fetch all gigs with optional query params (search, filter, pagination)
 */
export const getAllGigs = createAsyncThunk(
  'gig/getAllGigs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getAllGigsService(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch gigs');
    }
  }
);

/**
 * Fetch the logged-in client's own gigs — any status, not just "open".
 * Kept in a separate `myGigs` state slice so it never gets overwritten
 * by (or overwrites) the public browse-all-gigs list.
 */
export const getMyGigs = createAsyncThunk(
  'gig/getMyGigs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyGigsService();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch your gigs');
    }
  }
);

/**
 * Fetch a single gig by ID
 */
export const getGigById = createAsyncThunk(
  'gig/getGigById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getGigByIdService(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch gig');
    }
  }
);

/**
 * Update an existing gig (client / owner only)
 */
export const updateGig = createAsyncThunk(
  'gig/updateGig',
  async ({ id, gigData }, { rejectWithValue }) => {
    try {
      const response = await updateGigService(id, gigData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update gig');
    }
  }
);

/**
 * Delete a gig (client / owner only)
 */
export const deleteGig = createAsyncThunk(
  'gig/deleteGig',
  async (id, { rejectWithValue }) => {
    try {
      await deleteGigService(id);
      // Return the deleted id so we can splice it from state
      return { id };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete gig');
    }
  }
);



export const getRecommendedGigs = createAsyncThunk(
  "gig/getRecommendedGigs",
  async (_, { rejectWithValue }) => {
    try {
      const response =
        await getRecommendedGigsService();

      return response;
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to fetch recommendations"
      );
    }
  }
);







// ============================================================
// Initial State
// ============================================================

const initialState = {
  gigs: [],
  myGigs: [],
  recommendedGigs: [],
  selectedGig: null,
  loading: false,
  myGigsLoading: false,
  success: false,
  error: null,
};

// ============================================================
// Slice
// ============================================================

const gigSlice = createSlice({
  name: 'gig',
  initialState,
  reducers: {
    // Clear any existing API error (call before re-submitting a form)
    clearGigError: (state) => {
      state.error = null;
    },
    // Clear the success flag (call after showing a success toast/message)
    clearGigSuccess: (state) => {
      state.success = false;
    },
    // Clear the selected gig (call on component unmount / navigation)
    clearSelectedGig: (state) => {
      state.selectedGig = null;
    },
  },
  extraReducers: (builder) => {
    // ----------------------------------------------------------
    // createGig
    // ----------------------------------------------------------
    builder
      .addCase(createGig.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Prepend the new gig to the list so it appears at the top
        state.gigs.unshift(action.payload.gig || action.payload);
        // Also keep myGigs in sync so it shows up immediately without a refetch
        state.myGigs.unshift(action.payload.gig || action.payload);
      })
      .addCase(createGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ----------------------------------------------------------
    // getAllGigs
    // ----------------------------------------------------------
    builder
      .addCase(getAllGigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllGigs.fulfilled, (state, action) => {
        state.loading = false;
        // Support both { gigs: [] } and a plain array response shape
        state.gigs = action.payload.gigs ?? action.payload;
      })
      .addCase(getAllGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ----------------------------------------------------------
    // getMyGigs
    // ----------------------------------------------------------
    builder
      .addCase(getMyGigs.pending, (state) => {
        state.myGigsLoading = true;
        state.error = null;
      })
      .addCase(getMyGigs.fulfilled, (state, action) => {
        state.myGigsLoading = false;
        const gigs = action.payload?.gigs ?? action.payload;
        state.myGigs = Array.isArray(gigs) ? gigs : [];
      })
      .addCase(getMyGigs.rejected, (state, action) => {
        state.myGigsLoading = false;
        state.error = action.payload;
      });

    // ----------------------------------------------------------
    // getGigById
    // ----------------------------------------------------------
    builder
      .addCase(getGigById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedGig = null;
      })
      .addCase(getGigById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedGig = action.payload.gig ?? action.payload;
      })
      .addCase(getGigById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ----------------------------------------------------------
    // updateGig
    // ----------------------------------------------------------
    builder
      .addCase(updateGig.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateGig.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updated = action.payload.gig ?? action.payload;
        // Replace the stale entry in the gigs array
        const index = state.gigs.findIndex((g) => g._id === updated._id);
        if (index !== -1) {
          state.gigs[index] = updated;
        }
        // Also refresh the entry in myGigs if present
        const myIndex = state.myGigs.findIndex((g) => g._id === updated._id);
        if (myIndex !== -1) {
          state.myGigs[myIndex] = updated;
        }
        // Also refresh selectedGig if it is the one that was updated
        if (state.selectedGig?._id === updated._id) {
          state.selectedGig = updated;
        }
      })
      .addCase(updateGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
// ----------------------------------------------------------
// deleteGig
// ----------------------------------------------------------
builder
  .addCase(deleteGig.pending, (state) => {
    state.loading = true;
    state.error = null;
    state.success = false;
  })
  .addCase(deleteGig.fulfilled, (state, action) => {
    state.loading = false;
    state.success = true;

    const { id } = action.payload;

    state.gigs = state.gigs.filter(
      (g) => g._id !== id
    );

    state.myGigs = state.myGigs.filter(
      (g) => g._id !== id
    );

    if (state.selectedGig?._id === id) {
      state.selectedGig = null;
    }
  })
  .addCase(deleteGig.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })

  // ----------------------------------------------------------
  // getRecommendedGigs
  // ----------------------------------------------------------
  .addCase(
    getRecommendedGigs.pending,
    (state) => {
      state.loading = true;
      state.error = null;
    }
  )
  .addCase(
    getRecommendedGigs.fulfilled,
    (state, action) => {
      state.loading = false;

      state.recommendedGigs =
        action.payload.gigs ??
        action.payload;
    }
  )
  .addCase(
    getRecommendedGigs.rejected,
    (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  );
  },
});

export const {
  clearGigError,
  clearGigSuccess,
  clearSelectedGig,
} = gigSlice.actions;

export default gigSlice.reducer;