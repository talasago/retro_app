import { createSlice } from '@reduxjs/toolkit';

export interface SignUpModalState {
  isOpen: boolean;
}

const initialState: SignUpModalState = {
  isOpen: false,
};

export const signUpModalSlice = createSlice({
  name: 'signUpModal',
  initialState,
  reducers: {
    openSignUpModal: (state) => {
      state.isOpen = true;
    },
    closeSignUpModal: (state) => {
      state.isOpen = false;
    },
  },
});
