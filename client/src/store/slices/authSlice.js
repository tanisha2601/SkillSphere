import { createSlice } from "@reduxjs/toolkit";

const savedToken =
  localStorage.getItem(
    "token"
  );

const savedUser =
  localStorage.getItem(
    "user"
  );

const initialState = {
  user: savedUser
    ? JSON.parse(savedUser)
    : null,

  token: savedToken || null,

  isAuthenticated:
    !!savedToken,

  loading: false,

  error: null,
};

const authSlice =
  createSlice({
    name: "auth",

    initialState,

    reducers: {
      loginStart: (
        state
      ) => {
        state.loading =
          true;

        state.error =
          null;
      },

      loginSuccess: (
        state,
        action
      ) => {
        state.loading =
          false;

        state.user =
          action.payload.user;

        state.token =
          action.payload.token;

        state.isAuthenticated =
          true;

        state.error =
          null;

        localStorage.setItem(
          "token",
          action.payload.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            action.payload.user
          )
        );
      },

      loginFailure: (
        state,
        action
      ) => {
        state.loading =
          false;

        state.error =
          action.payload;
      },

      setUser: (
        state,
        action
      ) => {
        if (
          action.payload.user
        ) {
          state.user =
            action.payload.user;

          state.token =
            action.payload.token;

          state.isAuthenticated =
            true;

          localStorage.setItem(
            "user",
            JSON.stringify(
              action.payload.user
            )
          );

          if (
            action.payload
              .token
          ) {
            localStorage.setItem(
              "token",
              action.payload
                .token
            );
          }
        } else {
          state.user =
            action.payload;

          state.isAuthenticated =
            true;

          localStorage.setItem(
            "user",
            JSON.stringify(
              action.payload
            )
          );
        }
      },

      logout: (
        state
      ) => {
        state.user =
          null;

        state.token =
          null;

        state.loading =
          false;

        state.error =
          null;

        state.isAuthenticated =
          false;

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );
      },
    },
  });

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setUser,
} = authSlice.actions;

export default authSlice.reducer;