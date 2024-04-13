import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export interface AuthState {
  isLogined: boolean;
  accessToken: string;
  refreshToken: string;
}

const initialState: AuthState = {
  isLogined: false,
  accessToken: '',
  refreshToken: '',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<AuthState>) => {
      state.isLogined = true;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    resetToken: (state) => {
      state.isLogined = false;
      state.accessToken = '';
      state.refreshToken = '';
    },
  },
});
