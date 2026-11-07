import { describe, expect, it } from 'vitest';

import {
  profileOrdersConnect,
  profileOrdersFailed,
  profileOrdersSlice,
  profileOrdersUpdated,
} from './profile-orders-slice';

import type { TOrder } from '@utils/types';

const { reducer } = profileOrdersSlice;

const order: TOrder = {
  _id: 'order-1',
  ingredients: ['bun'],
  status: 'pending',
  name: 'Галактический бургер',
  number: 20,
  createdAt: '2026-11-06T08:00:00.000Z',
  updatedAt: '2026-11-06T08:00:15.000Z',
};

describe('profileOrdersSlice', () => {
  it('заменяет историю целиком последним сообщением сокета', () => {
    const previous = reducer(
      undefined,
      profileOrdersUpdated({ orders: [order], total: 1, totalToday: 1 })
    );
    const next = reducer(
      previous,
      profileOrdersUpdated({
        orders: [{ ...order, _id: 'order-2', number: 21, status: 'done' }],
        total: 2,
        totalToday: 2,
      })
    );

    expect(next.orders).toEqual([
      { ...order, _id: 'order-2', number: 21, status: 'done' },
    ]);
    expect(next.status).toBe('live');
    expect(next.error).toBeNull();
  });

  it('сохраняет прошлые заказы, если токен или соединение не обновились', () => {
    const live = reducer(
      undefined,
      profileOrdersUpdated({ orders: [order], total: 1, totalToday: 1 })
    );
    const failed = reducer(live, profileOrdersFailed('Не удалось обновить токен'));

    expect(failed.orders).toEqual([order]);
    expect(failed.status).toBe('closed');
    expect(reducer(failed, profileOrdersConnect()).error).toBeNull();
    expect(reducer(failed, profileOrdersConnect()).orders).toEqual([order]);
  });
});
