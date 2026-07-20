import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,

  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
    },

    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },

    markAllRead: (state) => {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        isRead: true,
      }));
      state.unreadCount = 0;
    },

    markOneRead: (state, action) => {
      const idx = state.notifications.findIndex(
        (n) => n._id === action.payload
      );
      if (idx !== -1 && !state.notifications[idx].isRead) {
        state.notifications[idx].isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    removeNotification: (state, action) => {
      const idx = state.notifications.findIndex(
        (n) => n._id === action.payload
      );
      if (idx !== -1) {
        if (!state.notifications[idx].isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(idx, 1);
      }
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAllRead,
  markOneRead,
  removeNotification,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;