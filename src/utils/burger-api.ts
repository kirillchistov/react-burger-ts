import { BURGER_API_URL } from '@utils/constants';

import type { TIngredient } from '@utils/types';

type TServerResponse<T> = {
  success: boolean;
} & T;

type TIngredientsResponse = TServerResponse<{
  data: TIngredient[];
}>;

const defaultErrorMessage =
  'Не удалось загрузить ингредиенты. Попробуйте обновить страницу.';

export const getErrorMessage = (error: unknown): string => {
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

  return defaultErrorMessage;
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

      return Promise.reject(new Error(defaultErrorMessage));
    });
