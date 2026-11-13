import { feedMessage, remoteOrder } from '../fixtures/orders';

import type { Page } from '@playwright/test';
import type { TOrder, TOrdersFeed } from '@utils/types';

export const mockFeedSocket = async (
  page: Page,
  payload: TOrdersFeed & { success: true } = feedMessage
): Promise<void> => {
  await page.routeWebSocket(/\/orders\/all/, (ws): void => {
    const sendFeed = (): void => {
      ws.send(JSON.stringify(payload));
    };

    sendFeed();
    setTimeout(sendFeed, 50);
  });
};

export const mockOrderById = async (
  page: Page,
  orders: TOrder[] = [remoteOrder]
): Promise<void> => {
  const ordersById = new Map(orders.map((item) => [item._id, item]));

  await page.route('**/api/orders/*', async (route): Promise<void> => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }

    const id = route.request().url().split('/').pop() ?? '';
    const order = ordersById.get(id);

    if (!order) {
      await route.fulfill({
        json: { message: 'Order not found', success: false },
        status: 404,
      });
      return;
    }

    await route.fulfill({
      json: { orders: [order], success: true },
    });
  });
};

export const openFeed = async (page: Page): Promise<void> => {
  await page.goto('/feed');
  await page.getByRole('heading', { name: 'Лента заказов' }).waitFor();
};
