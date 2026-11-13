// S4.4 Тесты для авторизации
import { describe, expect, it } from 'vitest';

import {
  forgotPassword,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateUser,
} from './auth-actions';
import { authSlice, clearAuthError } from './auth-slice';

import type { TRegisterData, TUser } from '@utils/types';

const { getInitialState, reducer } = authSlice;

const user: TUser = {
  email: 'ben@example.com',
  name: 'Бен',
};

const registerPayload: TRegisterData = {
  ...user,
  password: 'secret',
};

const busyState = {
  error: 'старая ошибка',
  isAuthChecked: false,
  isLoading: false,
  user: null,
};

describe('authSlice', (): void => {
  it('начинает без пользователя и без проверки сессии', (): void => {
    expect(getInitialState()).toEqual({
      error: null,
      isAuthChecked: false,
      isLoading: false,
      user: null,
    });
  });

  it('сбрасывает ошибку', (): void => {
    expect(reducer(busyState, clearAuthError()).error).toBeNull();
  });

  describe('registerUser', (): void => {
    it('включает загрузку и сбрасывает ошибку', (): void => {
      const next = reducer(busyState, registerUser.pending('req', registerPayload));

      expect(next.isLoading).toBe(true);
      expect(next.error).toBeNull();
    });

    it('сохраняет пользователя после успеха', (): void => {
      const next = reducer(
        { ...busyState, isLoading: true },
        registerUser.fulfilled(user, 'req', registerPayload)
      );

      expect(next).toMatchObject({
        isAuthChecked: true,
        isLoading: false,
        user,
      });
    });

    it('пишет ошибку из payload или запасной текст', (): void => {
      const withPayload = reducer(
        { ...busyState, isLoading: true },
        registerUser.rejected(null, 'req', registerPayload, 'занято')
      );
      const withFallback = reducer(
        { ...busyState, isLoading: true },
        registerUser.rejected(new Error('fail'), 'req', registerPayload)
      );

      expect(withPayload).toMatchObject({
        error: 'занято',
        isLoading: false,
      });
      expect(withFallback.error).toBe('Не удалось зарегистрироваться');
    });
  });

  describe('loginUser', (): void => {
    it('включает загрузку и сбрасывает ошибку', (): void => {
      const next = reducer(
        busyState,
        loginUser.pending('req', { email: user.email, password: 'secret' })
      );

      expect(next.isLoading).toBe(true);
      expect(next.error).toBeNull();
    });

    it('сохраняет пользователя после успеха', (): void => {
      const next = reducer(
        { ...busyState, isLoading: true },
        loginUser.fulfilled(user, 'req', { email: user.email, password: 'secret' })
      );

      expect(next).toMatchObject({
        isAuthChecked: true,
        isLoading: false,
        user,
      });
    });

    it('пишет ошибку из payload или запасной текст', (): void => {
      const arg = { email: user.email, password: 'secret' };
      const withPayload = reducer(
        { ...busyState, isLoading: true },
        loginUser.rejected(null, 'req', arg, 'неверные данные')
      );
      const withFallback = reducer(
        { ...busyState, isLoading: true },
        loginUser.rejected(new Error('fail'), 'req', arg)
      );

      expect(withPayload.error).toBe('неверные данные');
      expect(withFallback.error).toBe('Не удалось войти');
    });
  });

  describe('logoutUser', (): void => {
    const loggedIn = {
      error: 'старая ошибка',
      isAuthChecked: true,
      isLoading: true,
      user,
    };

    it('очищает пользователя после успеха', (): void => {
      expect(
        reducer(loggedIn, logoutUser.fulfilled(undefined, 'req', undefined))
      ).toEqual({
        error: null,
        isAuthChecked: true,
        isLoading: false,
        user: null,
      });
    });

    it('всё равно выходит при ошибке и пишет payload, если он есть', (): void => {
      const withPayload = reducer(
        loggedIn,
        logoutUser.rejected(null, 'req', undefined, 'сеть недоступна')
      );
      const withoutPayload = reducer(
        loggedIn,
        logoutUser.rejected(new Error('fail'), 'req', undefined)
      );

      expect(withPayload).toMatchObject({
        error: 'сеть недоступна',
        isAuthChecked: true,
        isLoading: false,
        user: null,
      });
      expect(withoutPayload.error).toBeNull();
    });
  });

  describe('getUser', (): void => {
    it('сбрасывает ошибку на старте проверки', (): void => {
      expect(reducer(busyState, getUser.pending('req', undefined)).error).toBeNull();
    });

    it('кладёт пользователя или оставляет гостя после успеха', (): void => {
      const withUser = reducer(busyState, getUser.fulfilled(user, 'req', undefined));
      const guest = reducer(busyState, getUser.fulfilled(null, 'req', undefined));

      expect(withUser).toMatchObject({ isAuthChecked: true, user });
      expect(guest).toMatchObject({ isAuthChecked: true, user: null });
    });

    it('считает сессию проверенной, даже если запрос не удался', (): void => {
      const next = reducer(
        { ...busyState, user },
        getUser.rejected(new Error('fail'), 'req', undefined)
      );

      expect(next).toMatchObject({
        isAuthChecked: true,
        user: null,
      });
    });
  });

  describe('updateUser', (): void => {
    it('включает загрузку и сбрасывает ошибку', (): void => {
      const next = reducer(busyState, updateUser.pending('req', user));

      expect(next.isLoading).toBe(true);
      expect(next.error).toBeNull();
    });

    it('подставляет обновлённого пользователя', (): void => {
      const updated = { email: 'new@example.com', name: 'Новый' };
      const next = reducer(
        { error: null, isAuthChecked: true, isLoading: true, user },
        updateUser.fulfilled(updated, 'req', updated)
      );

      expect(next).toMatchObject({
        isLoading: false,
        user: updated,
      });
    });

    it('пишет ошибку из payload или запасной текст', (): void => {
      const withPayload = reducer(
        { ...busyState, isLoading: true },
        updateUser.rejected(null, 'req', user, 'не сохранилось')
      );
      const withFallback = reducer(
        { ...busyState, isLoading: true },
        updateUser.rejected(new Error('fail'), 'req', user)
      );

      expect(withPayload.error).toBe('не сохранилось');
      expect(withFallback.error).toBe('Не удалось сохранить профиль');
    });
  });

  describe('forgotPassword', (): void => {
    it('включает загрузку и сбрасывает ошибку', (): void => {
      const next = reducer(busyState, forgotPassword.pending('req', user.email));

      expect(next.isLoading).toBe(true);
      expect(next.error).toBeNull();
    });

    it('снимает загрузку после успеха', (): void => {
      const next = reducer(
        { ...busyState, isLoading: true },
        forgotPassword.fulfilled(undefined, 'req', user.email)
      );

      expect(next.isLoading).toBe(false);
    });

    it('пишет ошибку из payload или запасной текст', (): void => {
      const withPayload = reducer(
        { ...busyState, isLoading: true },
        forgotPassword.rejected(null, 'req', user.email, 'нет такого email')
      );
      const withFallback = reducer(
        { ...busyState, isLoading: true },
        forgotPassword.rejected(new Error('fail'), 'req', user.email)
      );

      expect(withPayload.error).toBe('нет такого email');
      expect(withFallback.error).toBe('Не удалось отправить письмо');
    });
  });

  describe('resetPassword', (): void => {
    const payload = { password: 'new-pass', token: 'code' };

    it('включает загрузку и сбрасывает ошибку', (): void => {
      const next = reducer(busyState, resetPassword.pending('req', payload));

      expect(next.isLoading).toBe(true);
      expect(next.error).toBeNull();
    });

    it('снимает загрузку после успеха', (): void => {
      const next = reducer(
        { ...busyState, isLoading: true },
        resetPassword.fulfilled(undefined, 'req', payload)
      );

      expect(next.isLoading).toBe(false);
    });

    it('пишет ошибку из payload или запасной текст', (): void => {
      const withPayload = reducer(
        { ...busyState, isLoading: true },
        resetPassword.rejected(null, 'req', payload, 'неверный код')
      );
      const withFallback = reducer(
        { ...busyState, isLoading: true },
        resetPassword.rejected(new Error('fail'), 'req', payload)
      );

      expect(withPayload.error).toBe('неверный код');
      expect(withFallback.error).toBe('Не удалось сохранить новый пароль');
    });
  });
});
