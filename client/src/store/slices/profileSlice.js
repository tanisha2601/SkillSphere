import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null,        // full user object from DB
  stats: null,          // { completion, profileViews, ... }
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,

  reducers: {
    profileLoadStart: (state) => {
      state.loading = true;
      state.error   = null;
    },

    setProfile: (state, action) => {
      state.loading = false;
      state.profile = action.payload;
      state.error   = null;
    },

    setStats: (state, action) => {
      state.stats = action.payload;
    },

    // Merge partial updates without overwriting the whole object
    updateProfileField: (state, action) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },

    // Replace a sub-array (portfolioProjects / certifications / workTimeline / activity)
    setSubResource: (state, action) => {
      const { key, data } = action.payload;
      if (state.profile) {
        state.profile[key] = data;
      }
    },

    profileLoadError: (state, action) => {
      state.loading = false;
      state.error   = action.payload;
    },

    clearProfile: (state) => {
      state.profile = null;
      state.stats   = null;
      state.loading = false;
      state.error   = null;
    },
  },
});

export const {
  profileLoadStart,
  setProfile,
  setStats,
  updateProfileField,
  setSubResource,
  profileLoadError,
  clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
