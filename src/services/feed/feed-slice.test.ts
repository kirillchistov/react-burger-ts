import { describe, expect, it } from 'vitest';

import {
  feedClosed,
  feedConnecting,
  feedDisconnect,
  feedFailed,
  feedSlice,
  feedUpdated,
} from './feed-slice';

import type { TOrder } from '@utils/types';

const { getInitialState, reducer } = feedSlice;

const order: TOrder = {
  _id: 'order-1',
  ingredients: ['bun'],
  status: 'pending',
  name: 'Галактический бургер',
  number: 20,
  createdAt: '2026-11-06T08:00:00.000Z',
  updatedAt: '2026-11-06T08:00:15.000Z',
};

describe('feedSlice', () => {
  it('начинает с пустой ленты и статусом idle', () => {
    expect(getInitialState()).toEqual({
      error: null,
      orders: [],
      status: 'idle',
      total: 0,
      totalToday: 0,
    });
  });

  it('переходит в connecting и сбрасывает ошибку', () => {
    const failed = reducer(
      getInitialState(),
      feedFailed('Не удалось подключиться к ленте заказов')
    );

    expect(reducer(failed, feedConnecting())).toMatchObject({
      error: null,
      status: 'connecting',
    });
  });

  it('заменяет ленту целиком последним сообщением сокета', () => {
    const previous = reducer(
      undefined,
      feedUpdated({ orders: [order], total: 1, totalToday: 1 })
    );
    const next = reducer(
      previous,
      feedUpdated({
        orders: [{ ...order, _id: 'order-2', number: 21, status: 'done' }],
        total: 10,
        totalToday: 2,
      })
    );

    expect(next.orders).toEqual([
      { ...order, _id: 'order-2', number: 21, status: 'done' },
    ]);
    expect(next.total).toBe(10);
    expect(next.totalToday).toBe(2);
    expect(next.status).toBe('live');
    expect(next.error).toBeNull();
  });

  it('сохраняет прошлую ленту, если соединение оборвалось', () => {
    const live = reducer(
      undefined,
      feedUpdated({ orders: [order], total: 5, totalToday: 1 })
    );
    const closed = reducer(live, feedFailed('Не удалось подключиться к ленте заказов'));

    expect(closed.orders).toEqual([live.orders[0]]);
    expect(closed.total).toBe(5);
    expect(closed.error).toBe('Не удалось подключиться к ленте заказов');
    expect(closed.status).toBe('closed');
  });

  it('оставляет заказы на экране, когда сокет закрывают при уходе со страницы', () => {
    const live = reducer(
      undefined,
      feedUpdated({ orders: [order], total: 5, totalToday: 1 })
    );

    expect(reducer(live, feedDisconnect()).orders).toEqual(live.orders);
    expect(reducer(live, feedClosed()).orders).toEqual(live.orders);
    expect(reducer(live, feedClosed()).error).toBeNull();
  });
});
