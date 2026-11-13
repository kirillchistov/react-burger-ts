import type { TOrder, TOrdersFeed } from '@utils/types';

export const doneOrder: TOrder = {
  _id: 'feed-order-done',
  ingredients: ['bun-1', 'sauce-1', 'bun-1'],
  status: 'done',
  name: 'Краторный spicy бургер',
  number: 34536,
  createdAt: '2026-11-06T08:00:00.000Z',
  updatedAt: '2026-11-06T08:00:15.000Z',
};

export const pendingOrder: TOrder = {
  _id: 'feed-order-pending',
  ingredients: ['bun-1', 'main-1', 'bun-1'],
  status: 'pending',
  name: 'Краторный био-бургер',
  number: 34500,
  createdAt: '2026-11-06T09:00:00.000Z',
  updatedAt: '2026-11-06T09:00:15.000Z',
};

export const remoteOrder: TOrder = {
  _id: 'feed-order-remote',
  ingredients: ['bun-1', 'sauce-1', 'main-1', 'bun-1'],
  status: 'done',
  name: 'Галактический бургер',
  number: 99999,
  createdAt: '2026-11-05T12:00:00.000Z',
  updatedAt: '2026-11-05T12:00:20.000Z',
};

export const feedMessage: TOrdersFeed & { success: true } = {
  success: true,
  orders: [doneOrder, pendingOrder],
  total: 2231,
  totalToday: 4,
};
