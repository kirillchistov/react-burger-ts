import { expect, test } from '@playwright/test';

import {
  profileCreatedOrder,
  profileDoneOrder,
  profileOrdersMessage,
  profilePendingOrder,
} from './fixtures/orders';
import { mockBurgerApi, seedAuth } from './helpers/app';
import {
  FRESH_ACCESS_TOKEN,
  mockProfileOrdersSocket,
  mockRefreshToken,
  openProfileOrders,
  SEEDED_ACCESS_TOKEN,
  SEEDED_REFRESH_TOKEN,
} from './helpers/profile-orders';

test.describe('История заказов', (): void => {
  test.beforeEach(async ({ page }): Promise<void> => {
    await mockBurgerApi(page);
    await seedAuth(page);
  });

  test('подключается к сокету без Bearer и показывает статусы заказов', async ({
    page,
  }): Promise<void> => {
    const socketUrls: string[] = [];
    await mockProfileOrdersSocket(page, {
      onConnect: (url): void => {
        socketUrls.push(url);
      },
    });

    await openProfileOrders(page);

    expect(socketUrls.length).toBeGreaterThan(0);
    for (const url of socketUrls) {
      expect(url).toContain(`token=${SEEDED_ACCESS_TOKEN}`);
      expect(url).not.toMatch(/Bearer/i);
    }

    const doneCard = page.getByTestId(`order-${profileDoneOrder._id}`);
    const pendingCard = page.getByTestId(`order-${profilePendingOrder._id}`);
    const createdCard = page.getByTestId(`order-${profileCreatedOrder._id}`);

    await expect(doneCard.getByText('#034536')).toBeVisible();
    await expect(doneCard.getByText('Выполнен')).toBeVisible();
    await expect(pendingCard.getByText('#034500')).toBeVisible();
    await expect(pendingCard.getByText('Готовится')).toBeVisible();
    await expect(createdCard.getByText('#034400')).toBeVisible();
    await expect(createdCard.getByText('Создан')).toBeVisible();
    await expect(
      page.getByText('В этом разделе вы можете просмотреть свою историю заказов')
    ).toBeVisible();
  });

  test('клик по заказу открывает модалку поверх истории', async ({
    page,
  }): Promise<void> => {
    await mockProfileOrdersSocket(page);
    await openProfileOrders(page);

    await page.getByTestId(`order-${profileDoneOrder._id}`).click();

    await expect(page).toHaveURL(new RegExp(`/profile/orders/${profileDoneOrder._id}`));
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('#034536')).toBeVisible();
    await expect(modal.getByText(profileDoneOrder.name)).toBeVisible();
    await expect(modal.getByText('Выполнен')).toBeVisible();
    await expect(page.getByRole('link', { name: 'История заказов' })).toBeVisible();
  });

  test('после Invalid or missing token обновляет токен и подключается снова', async ({
    page,
  }): Promise<void> => {
    const socketUrls: string[] = [];
    await mockRefreshToken(page);
    await mockProfileOrdersSocket(page, {
      messageFor: (url): unknown => {
        const token = new URL(url).searchParams.get('token');

        return token === SEEDED_ACCESS_TOKEN
          ? { message: 'Invalid or missing token' }
          : profileOrdersMessage;
      },
      onConnect: (url): void => {
        socketUrls.push(url);
      },
    });

    const refreshRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().includes('/api/auth/token')
    );

    await page.goto('/profile/orders');

    const request = await refreshRequest;
    expect(request.postDataJSON()).toEqual({ token: SEEDED_REFRESH_TOKEN });

    await page.getByTestId(`order-${profileDoneOrder._id}`).waitFor();

    expect(socketUrls.some((url) => url.includes(`token=${SEEDED_ACCESS_TOKEN}`))).toBe(
      true
    );
    expect(socketUrls.some((url) => url.includes(`token=${FRESH_ACCESS_TOKEN}`))).toBe(
      true
    );
    for (const url of socketUrls) {
      expect(url).not.toMatch(/Bearer/i);
    }
    await expect(page.getByText('Выполнен')).toBeVisible();
  });
});
