import { configureStore } from '@reduxjs/toolkit';
import { alertSlice } from './alert';

export const store = configureStore({
  reducer: {
    alert: alertSlice.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
