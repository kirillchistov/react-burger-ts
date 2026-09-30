import { createSlice } from '@reduxjs/toolkit';

import {
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
} from './auth-actions';

import type { TUser } from '@utils/types';

type TAuthState = {
  error: string | null;
  isAuthChecked: boolean;
  isLoading: boolean;
  user: TUser | null;
};

const initialState: TAuthState = {
  error: null,
  isAuthChecked: false,
  isLoading: false,
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Не удалось зарегистрироваться';
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Не удалось войти';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.error = null;
        state.isLoading = false;
        state.isAuthChecked = true;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.user = null;
        state.isLoading = false;
        state.isAuthChecked = true;
        state.error = action.payload ?? null;
      })
      .addCase(getUser.pending, (state) => {
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(getUser.rejected, (state) => {
        state.user = null;
        state.isAuthChecked = true;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Не удалось сохранить профиль';
      });
  },
  selectors: {
    selectAuthError: (state): string | null => state.error,
    selectAuthIsLoading: (state): boolean => state.isLoading,
    selectIsAuthChecked: (state): boolean => state.isAuthChecked,
    selectUser: (state): TUser | null => state.user,
  },
});

export const { clearAuthError } = authSlice.actions;

export const { selectAuthError, selectAuthIsLoading, selectIsAuthChecked, selectUser } =
  authSlice.selectors;
