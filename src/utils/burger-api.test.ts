import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ACCESS_TOKEN_KEY, BURGER_API_URL, REFRESH_TOKEN_KEY } from '@utils/constants';

import {
  checkResponse,
  createOrderApi,
  fetchWithRefresh,
  getOrderByIdApi,
} from './burger-api';

import type { TOrder } from '@utils/types';

const fetchMock = vi.fn();

const jsonResponse = (
  body: unknown,
  init?: { ok?: boolean; status?: number }
): Response => {
  const ok = init?.ok ?? true;

  return {
    json: (): Promise<unknown> => Promise.resolve(body),
    ok,
    status: init?.status ?? (ok ? 200 : 401),
  } as Response;
};

const order: TOrder = {
  _id: 'order-1',
  ingredients: ['bun-1', 'sauce-1', 'bun-1'],
  status: 'done',
  name: 'Краторный spicy бургер',
  number: 34536,
  createdAt: '2026-11-06T08:00:00.000Z',
  updatedAt: '2026-11-06T08:00:15.000Z',
};

const seedTokens = (
  accessToken = 'Bearer old-access',
  refreshToken = 'old-refresh'
): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

const requestUrl = (call: unknown[]): string => String(call[0]);

const requestInit = (call: unknown[]): RequestInit => (call[1] ?? {}) as RequestInit;

describe('burger-api', (): void => {
  beforeEach((): void => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    localStorage.clear();
  });

  afterEach((): void => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  describe('checkResponse', (): void => {
    it('возвращает json, если ответ успешный', async (): Promise<void> => {
      await expect(
        checkResponse(jsonResponse({ success: true, order: { number: 1 } }))
      ).resolves.toEqual({ success: true, order: { number: 1 } });
    });

    it('поднимает Error с message из тела, если статус не ok', async (): Promise<void> => {
      await expect(
        checkResponse(
          jsonResponse({ message: 'jwt expired' }, { ok: false, status: 403 })
        )
      ).rejects.toThrow('jwt expired');
    });

    it('пробрасывает Error из тела как есть', async (): Promise<void> => {
      const payload = new Error('сервер недоступен');

      await expect(
        checkResponse(jsonResponse(payload, { ok: false, status: 500 }))
      ).rejects.toBe(payload);
    });

    it('ставит запасной текст, если в теле нет message', async (): Promise<void> => {
      await expect(
        checkResponse(jsonResponse({ success: false }, { ok: false, status: 400 }))
      ).rejects.toThrow('Не удалось выполнить запрос. Попробуйте ещё раз.');
    });
  });

  describe('fetchWithRefresh', (): void => {
    it('отдаёт тело, если первый запрос успешен', async (): Promise<void> => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, ok: true }));

      await expect(
        fetchWithRefresh(`${BURGER_API_URL}/auth/user`, {
          headers: { authorization: 'Bearer old-access' },
          method: 'GET',
        })
      ).resolves.toEqual({ success: true, ok: true });

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('при jwt expired обновляет токен и повторяет исходный запрос', async (): Promise<void> => {
      seedTokens();
      fetchMock
        .mockResolvedValueOnce(
          jsonResponse({ message: 'jwt expired' }, { ok: false, status: 403 })
        )
        .mockResolvedValueOnce(
          jsonResponse({
            accessToken: 'Bearer new-access',
            refreshToken: 'new-refresh',
            success: true,
          })
        )
        .mockResolvedValueOnce(jsonResponse({ success: true, name: 'Бен' }));

      await expect(
        fetchWithRefresh(`${BURGER_API_URL}/auth/user`, {
          headers: { authorization: 'Bearer old-access' },
          method: 'GET',
        })
      ).resolves.toEqual({ success: true, name: 'Бен' });

      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(requestUrl(fetchMock.mock.calls[1])).toBe(`${BURGER_API_URL}/auth/token`);
      expect(requestInit(fetchMock.mock.calls[1])).toMatchObject({
        body: JSON.stringify({ token: 'old-refresh' }),
        method: 'POST',
      });
      expect(requestUrl(fetchMock.mock.calls[2])).toBe(`${BURGER_API_URL}/auth/user`);
      expect(
        new Headers(requestInit(fetchMock.mock.calls[2]).headers).get('authorization')
      ).toBe('Bearer new-access');
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('Bearer new-access');
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('new-refresh');
    });

    it('не ходит за токеном, если ошибка не jwt expired', async (): Promise<void> => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ message: 'Forbidden' }, { ok: false, status: 403 })
      );

      await expect(
        fetchWithRefresh(`${BURGER_API_URL}/orders`, { method: 'POST' })
      ).rejects.toThrow('Forbidden');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('чистит токены, если обновление не удалось', async (): Promise<void> => {
      seedTokens();
      fetchMock
        .mockResolvedValueOnce(
          jsonResponse({ message: 'jwt expired' }, { ok: false, status: 403 })
        )
        .mockResolvedValueOnce(
          jsonResponse(
            { message: 'Invalid or missing token' },
            { ok: false, status: 401 }
          )
        );

      await expect(
        fetchWithRefresh(`${BURGER_API_URL}/orders`, {
          headers: { authorization: 'Bearer old-access' },
          method: 'POST',
        })
      ).rejects.toThrow('Invalid or missing token');

      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    });

    it('чистит токены, если refreshToken нет', async (): Promise<void> => {
      localStorage.setItem(ACCESS_TOKEN_KEY, 'Bearer old-access');
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ message: 'jwt expired' }, { ok: false, status: 403 })
      );

      await expect(
        fetchWithRefresh(`${BURGER_API_URL}/orders`, { method: 'POST' })
      ).rejects.toThrow('Нет refreshToken');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    });
  });

  describe('createOrderApi', (): void => {
    it('отправляет состав и возвращает номер заказа', async (): Promise<void> => {
      seedTokens('Bearer access');
      fetchMock.mockResolvedValueOnce(
        jsonResponse({
          name: 'Краторный spicy бургер',
          order: { number: 34536 },
          success: true,
        })
      );

      await expect(createOrderApi(['bun-1', 'sauce-1', 'bun-1'])).resolves.toBe(34536);

      expect(requestUrl(fetchMock.mock.calls[0])).toBe(`${BURGER_API_URL}/orders`);
      expect(requestInit(fetchMock.mock.calls[0])).toMatchObject({
        body: JSON.stringify({ ingredients: ['bun-1', 'sauce-1', 'bun-1'] }),
        method: 'POST',
      });
      expect(
        new Headers(requestInit(fetchMock.mock.calls[0]).headers).get('authorization')
      ).toBe('Bearer access');
    });

    it('после jwt expired повторяет заказ с новым токеном', async (): Promise<void> => {
      seedTokens();
      fetchMock
        .mockResolvedValueOnce(
          jsonResponse({ message: 'jwt expired' }, { ok: false, status: 403 })
        )
        .mockResolvedValueOnce(
          jsonResponse({
            accessToken: 'Bearer new-access',
            refreshToken: 'new-refresh',
            success: true,
          })
        )
        .mockResolvedValueOnce(
          jsonResponse({
            name: 'Краторный spicy бургер',
            order: { number: 777 },
            success: true,
          })
        );

      await expect(createOrderApi(['bun-1', 'bun-1'])).resolves.toBe(777);
      expect(
        new Headers(requestInit(fetchMock.mock.calls[2]).headers).get('authorization')
      ).toBe('Bearer new-access');
    });

    it('падает с запасным текстом, если success: false', async (): Promise<void> => {
      seedTokens('Bearer access');
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ success: false, order: { number: 1 } })
      );

      await expect(createOrderApi(['bun-1'])).rejects.toThrow(
        'Не удалось оформить заказ. Попробуйте ещё раз.'
      );
    });
  });

  describe('getOrderByIdApi', (): void => {
    it('берёт заказ из поля order', async (): Promise<void> => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, order }));

      await expect(getOrderByIdApi('order-1')).resolves.toEqual(order);
      expect(requestUrl(fetchMock.mock.calls[0])).toBe(
        `${BURGER_API_URL}/orders/order-1`
      );
    });

    it('берёт первый элемент orders, если order нет', async (): Promise<void> => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, orders: [order] }));

      await expect(getOrderByIdApi('order-1')).resolves.toEqual(order);
    });

    it('передаёт AbortSignal в fetch', async (): Promise<void> => {
      const controller = new AbortController();
      fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, order }));

      await getOrderByIdApi('order-1', controller.signal);

      expect(requestInit(fetchMock.mock.calls[0]).signal).toBe(controller.signal);
    });

    it('ставит «не удалось загрузить», если статус не ok', async (): Promise<void> => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ message: 'not found' }, { ok: false, status: 404 })
      );

      await expect(getOrderByIdApi('missing')).rejects.toThrow(
        'Не удалось загрузить заказ'
      );
    });

    it('отклоняет ответ без валидного заказа', async (): Promise<void> => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ success: true, order: { _id: '', name: '' } })
      );

      await expect(getOrderByIdApi('order-1')).rejects.toThrow(
        'Не удалось загрузить заказ'
      );
    });
  });
});
