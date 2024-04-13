import { configureStore } from '@reduxjs/toolkit';
import { alertSlice } from './alert';
import { authSlice } from './auth';

export const store = configureStore({
  reducer: {
    alert: alertSlice.reducer,
    auth: authSlice.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
