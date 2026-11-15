import { afterEach, describe, expect, it, vi } from 'vitest';

import { formatOrderDate, isInvalidTokenMessage, parseOrdersFeed } from './order';

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

describe('formatOrderDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('показывает вчерашний вечер как «Вчера», а не «Сегодня» с будущим временем', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 15, 15, 33, 0));

    expect(formatOrderDate(new Date(2026, 10, 15, 12, 10, 0))).toBe('Сегодня, 12:10');
    expect(formatOrderDate(new Date(2026, 10, 14, 19, 46, 0))).toBe('Вчера, 19:46');
    expect(formatOrderDate(new Date(2026, 10, 14, 17, 12, 0))).toBe('Вчера, 17:12');
  });

  it('склоняет «N дней назад» по календарным суткам', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 15, 15, 33, 0));

    expect(formatOrderDate(new Date(2026, 10, 13, 9, 5, 0))).toBe('2 дня назад, 09:05');
    expect(formatOrderDate(new Date(2026, 10, 10, 8, 0, 0))).toBe('5 дней назад, 08:00');
    expect(formatOrderDate(new Date(2026, 10, 14, 0, 0, 0))).toBe('Вчера, 00:00');
  });
});

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

  it('узнаёт ответ сокета с устаревшим токеном', () => {
    expect(isInvalidTokenMessage({ message: 'Invalid or missing token' })).toBe(true);
    expect(
      isInvalidTokenMessage({ success: false, message: 'Invalid or missing token' })
    ).toBe(true);
    expect(isInvalidTokenMessage({ message: 'jwt expired' })).toBe(false);
  });
});
