import { BURGER_API_URL } from '@utils/constants';

import type { TIngredient } from '@utils/types';

type TServerResponse<T> = {
  success: boolean;
} & T;

type TIngredientsResponse = TServerResponse<{
  data: TIngredient[];
}>;

const defaultErrorMessage = 'Не удалось выполнить запрос. Попробуйте ещё раз.';
const ingredientsErrorMessage =
  'Не удалось загрузить ингредиенты. Попробуйте обновить страницу.';
const orderErrorMessage = 'Не удалось оформить заказ. Попробуйте ещё раз.';

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

type TOrderResponse = TServerResponse<{
  name: string;
  order: {
    number: number;
  };
}>;

export const createOrderApi = (ingredientIds: string[]): Promise<number> =>
  fetch(`${BURGER_API_URL}/orders`, {
    body: JSON.stringify({ ingredients: ingredientIds }),
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    method: 'POST',
  })
    .then((res) => checkResponse<TOrderResponse>(res))
    .then((data) => {
      if (data.success) {
        return data.order.number;
      }

      return Promise.reject(new Error(orderErrorMessage));
    });
