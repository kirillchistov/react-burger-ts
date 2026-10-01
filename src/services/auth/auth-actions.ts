// S3.5 Экшены для регистрации, входа, выхода, получения и обновления пользователя
import { createAsyncThunk } from '@reduxjs/toolkit';

import { clearTokens, getRefreshToken } from '@utils/auth';
import {
  forgotPasswordApi,
  getErrorMessage,
  getUserApi,
  loginApi,
  logoutApi,
  registerApi,
  resetPasswordApi,
  updateUserApi,
} from '@utils/burger-api';

import type { TUser } from '@utils/types';

export const registerUser = createAsyncThunk<
  TUser,
  { email: string; name: string; password: string },
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await registerApi(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Не удалось зарегистрироваться'));
  }
});

export const loginUser = createAsyncThunk<
  TUser,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  try {
    return await loginApi(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Не удалось войти'));
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_payload, { rejectWithValue }) => {
    try {
      await logoutApi();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Не удалось выйти из системы'));
    }
  }
);

export const getUser = createAsyncThunk<TUser | null, void, { rejectValue: string }>(
  'auth/getUser',
  async (_payload, { rejectWithValue }) => {
    if (!getRefreshToken()) {
      return null;
    }

    try {
      return await getUserApi();
    } catch (error) {
      clearTokens();
      return rejectWithValue(getErrorMessage(error, 'Не удалось получить пользователя'));
    }
  }
);

export const updateUser = createAsyncThunk<
  TUser,
  { email: string; name: string; password?: string },
  { rejectValue: string }
>('auth/updateUser', async (payload, { rejectWithValue }) => {
  try {
    return await updateUserApi(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Не удалось сохранить профиль'));
  }
});

export const forgotPassword = createAsyncThunk<void, string, { rejectValue: string }>(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      await forgotPasswordApi(email);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Не удалось отправить письмо'));
    }
  }
);

export const resetPassword = createAsyncThunk<
  void,
  { password: string; token: string },
  { rejectValue: string }
>('auth/resetPassword', async (payload, { rejectWithValue }) => {
  try {
    await resetPasswordApi(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Не удалось сохранить новый пароль'));
  }
});
