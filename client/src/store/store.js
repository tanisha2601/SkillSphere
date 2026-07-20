import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import gigReducer from "./slices/gigSlice";
import proposalReducer from "./slices/proposalSlice";
import contractReducer from "./slices/contractSlice";
import notificationReducer from "./slices/notificationSlice";
import reviewReducer from "./slices/reviewSlice";
import paymentReducer from "./slices/paymentSlice";
import adminReducer from "./slices/adminSlice";
import profileReducer from "./slices/profileSlice";
import verificationReducer from "./slices/verificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gig: gigReducer,
    proposal: proposalReducer,
    contract: contractReducer,
    notification: notificationReducer,
    review: reviewReducer,
    payment: paymentReducer,
    admin: adminReducer,
    profile: profileReducer,
    verification: verificationReducer,
  },
});

export default store;