import { afterEach, describe, expect, it } from 'vitest';

import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  RESET_PASSWORD_FLAG_KEY,
} from '@utils/constants';

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getWsAccessToken,
  isResetPasswordAllowed,
  setResetPasswordAllowed,
  setTokens,
} from './auth';

describe('auth utils', (): void => {
  afterEach((): void => {
    localStorage.clear();
  });

  describe('getWsAccessToken', (): void => {
    it('отдаёт токен без префикса Bearer', (): void => {
      localStorage.setItem(ACCESS_TOKEN_KEY, 'Bearer secret-token');

      expect(getWsAccessToken()).toBe('secret-token');
    });

    it('возвращает токен как есть, если префикса нет', (): void => {
      localStorage.setItem(ACCESS_TOKEN_KEY, 'raw-token');

      expect(getWsAccessToken()).toBe('raw-token');
    });

    it('возвращает null, если токена нет', (): void => {
      expect(getWsAccessToken()).toBeNull();
    });

    it('возвращает null, если после Bearer ничего нет', (): void => {
      localStorage.setItem(ACCESS_TOKEN_KEY, 'Bearer ');

      expect(getWsAccessToken()).toBeNull();
    });
  });

  describe('токены', (): void => {
    it('кладёт и читает access и refresh', (): void => {
      setTokens('Bearer access', 'refresh');

      expect(getAccessToken()).toBe('Bearer access');
      expect(getRefreshToken()).toBe('refresh');
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('Bearer access');
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh');
    });

    it('clearTokens удаляет оба ключа', (): void => {
      setTokens('Bearer access', 'refresh');
      clearTokens();

      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
      expect(getWsAccessToken()).toBeNull();
    });
  });

  describe('resetPasswordAllowed', (): void => {
    it('по умолчанию сброс запрещён', (): void => {
      expect(isResetPasswordAllowed()).toBe(false);
    });

    it('ставит и снимает флаг', (): void => {
      setResetPasswordAllowed(true);

      expect(localStorage.getItem(RESET_PASSWORD_FLAG_KEY)).toBe('true');
      expect(isResetPasswordAllowed()).toBe(true);

      setResetPasswordAllowed(false);

      expect(localStorage.getItem(RESET_PASSWORD_FLAG_KEY)).toBeNull();
      expect(isResetPasswordAllowed()).toBe(false);
    });

    it('не считает истинным любое другое значение', (): void => {
      localStorage.setItem(RESET_PASSWORD_FLAG_KEY, 'yes');

      expect(isResetPasswordAllowed()).toBe(false);
    });
  });
});
