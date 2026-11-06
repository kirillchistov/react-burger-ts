import { describe, expect, it } from 'vitest';

import { parseOrdersFeed } from './order';

import type { TOrder } from '@utils/types';

const order: TOrder = {
  _id: 'order-1',
  ingredients: ['bun'],
  status: 'done',
  name: 'Флюоресцентный бургер',
  number: 12,
  createdAt: '2026-11-06T08:00:00.000Z',
  updatedAt: '2026-11-06T08:00:15.000Z',
};

describe('parseOrdersFeed', () => {
  it('берёт счётчики с сервера и пропускает заказ без данных для карточки', () => {
    const feed = parseOrdersFeed({
      success: true,
      orders: [order, { ...order, _id: '', name: '' }],
      total: 2231,
      totalToday: 4,
    });

    expect(feed).toEqual({
      orders: [order],
      total: 2231,
      totalToday: 4,
    });
  });

  it('не принимает сообщение без успешного ответа', () => {
    expect(
      parseOrdersFeed({ success: false, orders: [order], total: 1, totalToday: 1 })
    ).toBe(null);
    expect(parseOrdersFeed({ message: 'Invalid or missing token' })).toBe(null);
  });
});
