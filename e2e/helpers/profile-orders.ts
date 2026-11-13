import { profileDoneOrder, profileOrdersMessage } from '../fixtures/orders';
import { gotoRoute } from './app';

import type { Page } from '@playwright/test';

export const FRESH_ACCESS_TOKEN = 'fresh-access-token';
export const FRESH_REFRESH_TOKEN = 'fresh-refresh-token';
export const SEEDED_ACCESS_TOKEN = 'test-access-token';
export const SEEDED_REFRESH_TOKEN = 'test-refresh-token';

const isProfileOrdersSocket = (url: URL): boolean =>
  url.pathname === '/orders' && url.searchParams.has('token');

type TProfileSocketOptions = {
  messageFor?: (url: string, connectionIndex: number) => unknown;
  onConnect?: (url: string) => void;
};

export const mockProfileOrdersSocket = async (
  page: Page,
  options: TProfileSocketOptions = {}
): Promise<void> => {
  let connectionIndex = 0;

  await page.routeWebSocket(isProfileOrdersSocket, (ws): void => {
    connectionIndex += 1;
    const url = ws.url();
    options.onConnect?.(url);

    const payload = options.messageFor?.(url, connectionIndex) ?? profileOrdersMessage;
    const sendMessage = (): void => {
      ws.send(JSON.stringify(payload));
    };

    setTimeout(sendMessage, 50);
  });
};

export const mockRefreshToken = async (page: Page): Promise<void> => {
  await page.route('**/api/auth/token', async (route): Promise<void> => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await route.fulfill({
      json: {
        accessToken: `Bearer ${FRESH_ACCESS_TOKEN}`,
        refreshToken: FRESH_REFRESH_TOKEN,
        success: true,
      },
    });
  });
};

export const openProfileOrders = async (page: Page): Promise<void> => {
  await gotoRoute(page, '/profile/orders');
  await page.getByTestId(`order-${profileDoneOrder._id}`).waitFor();
};
