import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { feedMiddleware } from './feed-middleware';
import { feedConnecting, feedSlice } from './feed-slice';

import type { TOrder } from '@utils/types';

class MockSocket {
  static instances: MockSocket[] = [];

  onmessage: ((event: MessageEvent<string>) => void) | null = null;

  constructor(_url: string) {
    MockSocket.instances.push(this);
  }

  close(): void {
    return undefined;
  }

  receive(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent<string>);
  }
}

const order: TOrder = {
  _id: 'order-1',
  ingredients: ['bun'],
  status: 'done',
  name: 'Флюоресцентный бургер',
  number: 12,
  createdAt: '2026-11-06T08:00:00.000Z',
  updatedAt: '2026-11-06T08:00:15.000Z',
};

describe('feedMiddleware', () => {
  beforeEach(() => {
    MockSocket.instances = [];
    vi.stubGlobal('WebSocket', MockSocket);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('заменяет ленту целиком и пропускает заказ без данных для карточки', () => {
    const store = configureStore({
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(feedMiddleware),
      reducer: feedSlice.reducer,
    });

    store.dispatch(feedConnecting());
    MockSocket.instances[0]?.receive({
      success: true,
      orders: [order, { ...order, _id: '', name: '' }],
      total: 40,
      totalToday: 3,
    });

    expect(store.getState()).toMatchObject({
      orders: [order],
      status: 'live',
      total: 40,
      totalToday: 3,
    });
  });
});
