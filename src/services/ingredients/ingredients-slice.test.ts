import { describe, expect, it } from 'vitest';

import { fetchIngredients } from './ingredients-actions';
import { ingredientsSlice } from './ingredients-slice';

import type { TIngredient } from '@utils/types';

const { getInitialState, reducer } = ingredientsSlice;

const bun: TIngredient = {
  _id: 'bun-1',
  name: 'Краторная булка',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'bun.png',
  image_large: 'bun-large.png',
  image_mobile: 'bun-mobile.png',
  __v: 0,
};

const loadingState = {
  error: 'старая ошибка',
  isLoading: false,
  items: [bun],
};

describe('ingredientsSlice', (): void => {
  it('начинает с пустого списка', (): void => {
    expect(getInitialState()).toEqual({
      error: null,
      isLoading: false,
      items: [],
    });
  });

  it('включает загрузку и сбрасывает ошибку', (): void => {
    const next = reducer(loadingState, fetchIngredients.pending('req', undefined));

    expect(next.isLoading).toBe(true);
    expect(next.error).toBeNull();
    expect(next.items).toEqual([bun]);
  });

  it('кладёт ингредиенты после успеха', (): void => {
    const next = reducer(
      { ...loadingState, isLoading: true },
      fetchIngredients.fulfilled([bun], 'req', undefined)
    );

    expect(next).toEqual({
      error: 'старая ошибка',
      isLoading: false,
      items: [bun],
    });
  });

  it('пишет ошибку из payload или запасной текст', (): void => {
    const withPayload = reducer(
      { ...loadingState, isLoading: true },
      fetchIngredients.rejected(null, 'req', undefined, 'сервер недоступен')
    );
    const withFallback = reducer(
      { ...loadingState, isLoading: true },
      fetchIngredients.rejected(new Error('fail'), 'req', undefined)
    );

    expect(withPayload).toMatchObject({
      error: 'сервер недоступен',
      isLoading: false,
    });
    expect(withFallback.error).toBe('Не удалось загрузить ингредиенты');
  });

  it('не трогает состояние, если запрос отменили', (): void => {
    const current = { ...loadingState, isLoading: true };
    const aborted = fetchIngredients.rejected(
      { message: 'Aborted', name: 'AbortError' },
      'req',
      undefined
    );

    expect(aborted.meta.aborted).toBe(true);
    expect(reducer(current, aborted)).toEqual(current);
  });
});
