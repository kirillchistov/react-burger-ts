import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { rootReducer } from '@services/store';
import { getOrderByIdApi } from '@utils/burger-api';

import { useOrder } from './useOrder';

import type { TOrder } from '@utils/types';
import type { ReactNode } from 'react';

vi.mock('@utils/burger-api', () => ({
  getErrorMessage: (error: unknown, fallback = 'Произошла ошибка'): string =>
    error instanceof Error && error.message.length > 0 ? error.message : fallback,
  getOrderByIdApi: vi.fn(),
}));

const feedOrder: TOrder = {
  _id: 'feed-order-1',
  ingredients: ['bun-1', 'sauce-1', 'bun-1'],
  status: 'done',
  name: 'Краторный spicy бургер',
  number: 34536,
  createdAt: '2026-11-06T08:00:00.000Z',
  updatedAt: '2026-11-06T08:00:15.000Z',
};

const profileOrder: TOrder = {
  ...feedOrder,
  _id: 'profile-order-1',
  name: 'Краторный био-бургер',
  number: 34500,
};

const remoteOrder: TOrder = {
  ...feedOrder,
  _id: 'remote-order-1',
  name: 'Галактический бургер',
  number: 99999,
};

const renderUseOrder = (
  id: string | undefined,
  preloadedState?: { feed?: { orders: TOrder[] }; profileOrders?: { orders: TOrder[] } }
): ReturnType<typeof renderHook<ReturnType<typeof useOrder>, unknown>> => {
  const store = configureStore({
    preloadedState: {
      feed: {
        error: null,
        orders: preloadedState?.feed?.orders ?? [],
        status: 'idle',
        total: 0,
        totalToday: 0,
      },
      profileOrders: {
        error: null,
        orders: preloadedState?.profileOrders?.orders ?? [],
        status: 'idle',
      },
    },
    reducer: rootReducer,
  });

  const wrapper = ({ children }: { children: ReactNode }): React.JSX.Element => (
    <Provider store={store}>{children}</Provider>
  );

  return renderHook(() => useOrder(id), { wrapper });
};

describe('useOrder', (): void => {
  beforeEach((): void => {
    vi.mocked(getOrderByIdApi).mockReset();
  });

  it('без id показывает, что заказ не найден', (): void => {
    const { result } = renderUseOrder(undefined);

    expect(result.current).toEqual({
      error: 'Заказ не найден',
      isLoading: false,
      order: null,
    });
    expect(getOrderByIdApi).not.toHaveBeenCalled();
  });

  it('берёт заказ из ленты без запроса', (): void => {
    const { result } = renderUseOrder(feedOrder._id, { feed: { orders: [feedOrder] } });

    expect(result.current.order).toEqual(feedOrder);
    expect(result.current.isLoading).toBe(false);
    expect(getOrderByIdApi).not.toHaveBeenCalled();
  });

  it('берёт заказ из истории без запроса', (): void => {
    const { result } = renderUseOrder(profileOrder._id, {
      profileOrders: { orders: [profileOrder] },
    });

    expect(result.current.order).toEqual(profileOrder);
    expect(getOrderByIdApi).not.toHaveBeenCalled();
  });

  it('берёт заказ из мок-ленты без запроса', (): void => {
    const { result } = renderUseOrder('mock-103219');

    expect(result.current.order?._id).toBe('mock-103219');
    expect(result.current.order?.number).toBe(103219);
    expect(getOrderByIdApi).not.toHaveBeenCalled();
  });

  it('запрашивает заказ по id и показывает загрузку', async (): Promise<void> => {
    vi.mocked(getOrderByIdApi).mockReturnValue(new Promise(() => undefined));

    const { result } = renderUseOrder(remoteOrder._id);

    await waitFor((): void => {
      expect(result.current.isLoading).toBe(true);
    });
    expect(result.current.order).toBeNull();
    expect(getOrderByIdApi).toHaveBeenCalledWith(
      remoteOrder._id,
      expect.any(AbortSignal)
    );
  });

  it('кладёт заказ из GET /orders/:id', async (): Promise<void> => {
    vi.mocked(getOrderByIdApi).mockResolvedValue(remoteOrder);

    const { result } = renderUseOrder(remoteOrder._id);

    await waitFor((): void => {
      expect(result.current.order).toEqual(remoteOrder);
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('показывает ошибку, если запрос не удался', async (): Promise<void> => {
    vi.mocked(getOrderByIdApi).mockRejectedValue(new Error('Заказ не найден'));

    const { result } = renderUseOrder(remoteOrder._id);

    await waitFor((): void => {
      expect(result.current.error).toBe('Заказ не найден');
    });
    expect(result.current.order).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('абортит запрос при размонтировании', async (): Promise<void> => {
    let signal: AbortSignal | undefined;
    vi.mocked(getOrderByIdApi).mockImplementation(
      (_id: string, requestSignal?: AbortSignal): Promise<TOrder> => {
        signal = requestSignal;
        return new Promise(() => undefined);
      }
    );

    const { unmount } = renderUseOrder(remoteOrder._id);

    await waitFor((): void => {
      expect(getOrderByIdApi).toHaveBeenCalled();
    });

    unmount();

    expect(signal?.aborted).toBe(true);
  });
});
