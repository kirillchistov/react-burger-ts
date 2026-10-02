// S3.3 Burger API - Основные функции
// S3.5 Burger API - Обновление токенов Авторизации, Обработка ошибок
// S3.6 Burger API - Запрос на восстановление пароля, Сброс пароля
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@utils/auth';
import { BURGER_API_URL } from '@utils/constants';

import type { TAuthTokens, TIngredient, TUser } from '@utils/types';

type TServerResponse<T> = {
  success: boolean;
} & T;

type TIngredientsResponse = TServerResponse<{
  data: TIngredient[];
}>;

type TOrderResponse = TServerResponse<{
  name: string;
  order: {
    number: number;
  };
}>;

type TAuthResponse = TServerResponse<
  TAuthTokens & {
    user: TUser;
  }
>;

type TUserResponse = TServerResponse<{
  user: TUser;
}>;

type TMessageResponse = TServerResponse<{
  message: string;
}>;

type TRefreshResponse = TServerResponse<TAuthTokens>;

const defaultErrorMessage = 'Не удалось выполнить запрос. Попробуйте ещё раз.';
const ingredientsErrorMessage =
  'Не удалось загрузить ингредиенты. Попробуйте обновить страницу.';
const orderErrorMessage = 'Не удалось оформить заказ. Попробуйте ещё раз.';
const jwtExpiredMessage = 'jwt expired';

export const getErrorMessage = (
  error: unknown,
  fallback = defaultErrorMessage
): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.length > 0 &&
    error.message !== 'Failed to fetch'
  ) {
    return error.message;
  }

  return fallback;
};

export const checkResponse = <T>(res: Response): Promise<T> => {
  if (res.ok) {
    return res.json() as Promise<T>;
  }

  return res
    .json()
    .then((err: unknown) =>
      Promise.reject(err instanceof Error ? err : new Error(getErrorMessage(err)))
    );
};

export const getIngredientsApi = (signal?: AbortSignal): Promise<TIngredient[]> =>
  fetch(`${BURGER_API_URL}/ingredients`, { signal })
    .then((res) => checkResponse<TIngredientsResponse>(res))
    .then((data) => {
      if (data.success) {
        return data.data;
      }

      return Promise.reject(new Error(ingredientsErrorMessage));
    });

const jsonHeaders = {
  'Content-Type': 'application/json;charset=utf-8',
};

export const refreshTokenApi = (): Promise<TAuthTokens> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return Promise.reject(new Error('Нет refreshToken'));
  }

  return fetch(`${BURGER_API_URL}/auth/token`, {
    body: JSON.stringify({ token: refreshToken }),
    headers: jsonHeaders,
    method: 'POST',
  })
    .then((res) => checkResponse<TRefreshResponse>(res))
    .then((data) => {
      if (data.success) {
        setTokens(data.accessToken, data.refreshToken);
        return { accessToken: data.accessToken, refreshToken: data.refreshToken };
      }

      return Promise.reject(new Error('Не удалось обновить токен'));
    });
};

export const fetchWithRefresh = <T>(url: string, options: RequestInit): Promise<T> =>
  fetch(url, options)
    .then((res) => checkResponse<T>(res))
    .catch((error: unknown) => {
      if (!(error instanceof Error) || error.message !== jwtExpiredMessage) {
        return Promise.reject(
          error instanceof Error ? error : new Error(getErrorMessage(error))
        );
      }

      return refreshTokenApi()
        .then((tokens) => {
          const headers = new Headers(options.headers);
          headers.set('authorization', tokens.accessToken);

          return fetch(url, { ...options, headers }).then((res) =>
            checkResponse<T>(res)
          );
        })
        .catch((refreshError: unknown) => {
          clearTokens();
          return Promise.reject(
            refreshError instanceof Error
              ? refreshError
              : new Error(getErrorMessage(refreshError))
          );
        });
    });

export const createOrderApi = (ingredientIds: string[]): Promise<number> =>
  fetchWithRefresh<TOrderResponse>(`${BURGER_API_URL}/orders`, {
    body: JSON.stringify({ ingredients: ingredientIds }),
    headers: {
      ...jsonHeaders,
      authorization: getAccessToken() ?? '',
    },
    method: 'POST',
  }).then((data) => {
    if (data.success) {
      return data.order.number;
    }

    return Promise.reject(new Error(orderErrorMessage));
  });

export const registerApi = (data: {
  email: string;
  name: string;
  password: string;
}): Promise<TUser> =>
  fetch(`${BURGER_API_URL}/auth/register`, {
    body: JSON.stringify(data),
    headers: jsonHeaders,
    method: 'POST',
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((response) => {
      if (response.success) {
        setTokens(response.accessToken, response.refreshToken);
        return response.user;
      }

      return Promise.reject(new Error('Не удалось зарегистрироваться'));
    });

export const loginApi = (data: { email: string; password: string }): Promise<TUser> =>
  fetch(`${BURGER_API_URL}/auth/login`, {
    body: JSON.stringify(data),
    headers: jsonHeaders,
    method: 'POST',
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((response) => {
      if (response.success) {
        setTokens(response.accessToken, response.refreshToken);
        return response.user;
      }

      return Promise.reject(new Error('Не удалось войти'));
    });

export const logoutApi = (): Promise<void> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    return Promise.resolve();
  }

  return fetch(`${BURGER_API_URL}/auth/logout`, {
    body: JSON.stringify({ token: refreshToken }),
    headers: jsonHeaders,
    method: 'POST',
  })
    .then((res) => checkResponse<TMessageResponse>(res))
    .then((response) => {
      clearTokens();

      if (response.success) {
        return;
      }

      return Promise.reject(new Error('Не удалось выйти из системы'));
    })
    .catch((error: unknown) => {
      clearTokens();
      return Promise.reject(
        error instanceof Error ? error : new Error(getErrorMessage(error))
      );
    });
};

export const getUserApi = (): Promise<TUser> =>
  fetchWithRefresh<TUserResponse>(`${BURGER_API_URL}/auth/user`, {
    headers: {
      authorization: getAccessToken() ?? '',
    },
    method: 'GET',
  }).then((data) => {
    if (data.success) {
      return data.user;
    }

    return Promise.reject(new Error('Не удалось получить данные пользователя'));
  });

export const updateUserApi = (data: {
  email: string;
  name: string;
  password?: string;
}): Promise<TUser> =>
  fetchWithRefresh<TUserResponse>(`${BURGER_API_URL}/auth/user`, {
    body: JSON.stringify(
      data.password !== undefined && data.password.length > 0
        ? data
        : { email: data.email, name: data.name }
    ),
    headers: {
      ...jsonHeaders,
      authorization: getAccessToken() ?? '',
    },
    method: 'PATCH',
  }).then((response) => {
    if (response.success) {
      return response.user;
    }

    return Promise.reject(new Error('Не удалось сохранить данные профиля'));
  });

export const forgotPasswordApi = (email: string): Promise<void> =>
  fetch(`${BURGER_API_URL}/password-reset`, {
    body: JSON.stringify({ email }),
    headers: jsonHeaders,
    method: 'POST',
  })
    .then((res) => checkResponse<TMessageResponse>(res))
    .then((data) => {
      if (data.success) {
        return;
      }

      return Promise.reject(new Error('Не удалось отправить письмо'));
    });

export const resetPasswordApi = (data: {
  password: string;
  token: string;
}): Promise<void> =>
  fetch(`${BURGER_API_URL}/password-reset/reset`, {
    body: JSON.stringify(data),
    headers: jsonHeaders,
    method: 'POST',
  })
    .then((res) => checkResponse<TMessageResponse>(res))
    .then((response) => {
      if (response.success) {
        return;
      }

      return Promise.reject(new Error('Не удалось сохранить новый пароль'));
    });
