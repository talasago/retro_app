import { configureStore } from '@reduxjs/toolkit';
import { alertSlice } from './alert';
import { loginModalSlice } from './loginModal';
import { signUpModalSlice } from './signUpModal';

export const store = configureStore({
  reducer: {
    alert: alertSlice.reducer,
    signUpModal: signUpModalSlice.reducer,
    loginModal: loginModalSlice.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
