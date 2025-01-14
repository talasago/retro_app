import { createSlice } from '@reduxjs/toolkit';

export interface LoginModalState {
  isOpen: boolean;
}

const initialState: LoginModalState = {
  isOpen: false,
};

export const loginModalSlice = createSlice({
  name: 'loginModal',
  initialState,
  reducers: {
    openLoginModal: (state) => {
      state.isOpen = true;
    },
    closeLoginModal: (state) => {
      state.isOpen = false;
    },
  },
});
