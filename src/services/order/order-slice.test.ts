import { describe, expect, it } from 'vitest';

import { createOrder } from './order-actions';
import { clearOrder, orderSlice } from './order-slice';

const { getInitialState, reducer } = orderSlice;

const busyState = {
  error: 'старая ошибка',
  isLoading: true,
  number: 4242,
};

describe('orderSlice', (): void => {
  it('начинает без номера заказа', (): void => {
    expect(getInitialState()).toEqual({
      error: null,
      isLoading: false,
      number: null,
    });
  });

  it('включает загрузку и сбрасывает прошлый заказ', (): void => {
    expect(reducer(busyState, createOrder.pending('req', ['bun']))).toEqual({
      error: null,
      isLoading: true,
      number: null,
    });
  });

  it('сохраняет номер после успеха', (): void => {
    const next = reducer(
      { error: null, isLoading: true, number: null },
      createOrder.fulfilled(100500, 'req', ['bun'])
    );

    expect(next).toEqual({
      error: null,
      isLoading: false,
      number: 100500,
    });
  });

  it('пишет ошибку из payload или запасной текст', (): void => {
    const withPayload = reducer(
      { error: null, isLoading: true, number: null },
      createOrder.rejected(null, 'req', ['bun'], 'нет булки')
    );
    const withFallback = reducer(
      { error: null, isLoading: true, number: null },
      createOrder.rejected(new Error('fail'), 'req', ['bun'])
    );

    expect(withPayload).toMatchObject({
      error: 'нет булки',
      isLoading: false,
    });
    expect(withFallback.error).toBe('Не удалось оформить заказ');
  });

  it('очищает номер, ошибку и загрузку', (): void => {
    expect(reducer(busyState, clearOrder())).toEqual(getInitialState());
  });
});
