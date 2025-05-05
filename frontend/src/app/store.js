import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice'; // adjust path if needed

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
