// S3.5 Авторизация и регистрация - Локальное хранилище токенов
// S3.6 Burger API - Восстановление пароля - Локальное хранилище флага
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  RESET_PASSWORD_FLAG_KEY,
} from '@utils/constants';

const ACCESS_TOKEN_TYPE = 'Bearer ';

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const getWsAccessToken = (): string | null => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return null;
  }

  if (!accessToken.startsWith(ACCESS_TOKEN_TYPE)) {
    return accessToken;
  }

  const token = accessToken.slice(ACCESS_TOKEN_TYPE.length);

  return token.length > 0 ? token : null;
};

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const setResetPasswordAllowed = (isAllowed: boolean): void => {
  if (isAllowed) {
    localStorage.setItem(RESET_PASSWORD_FLAG_KEY, 'true');
    return;
  }

  localStorage.removeItem(RESET_PASSWORD_FLAG_KEY);
};

export const isResetPasswordAllowed = (): boolean =>
  localStorage.getItem(RESET_PASSWORD_FLAG_KEY) === 'true';
