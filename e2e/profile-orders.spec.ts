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
  SEEDED_ACCESS_TOKEN,
  SEEDED_REFRESH_TOKEN,
} from './helpers/profile-orders';
import { expect, test } from './test';

test.describe('История заказов', (): void => {
  test.beforeEach(async ({ page }): Promise<void> => {
    await mockBurgerApi(page);
    await seedAuth(page);
  });

  test('подключается к сокету без Bearer и показывает статусы заказов', async ({
    page,
    profileOrdersPage,
  }): Promise<void> => {
    const socketUrls: string[] = [];
    await mockProfileOrdersSocket(page, {
      onConnect: (url): void => {
        socketUrls.push(url);
      },
    });

    await profileOrdersPage.goto();

    expect(socketUrls.length).toBeGreaterThan(0);
    for (const url of socketUrls) {
      expect(url).toContain(`token=${SEEDED_ACCESS_TOKEN}`);
      expect(url).not.toMatch(/Bearer/i);
    }

    const doneCard = profileOrdersPage.orderCard(profileDoneOrder._id);
    const pendingCard = profileOrdersPage.orderCard(profilePendingOrder._id);
    const createdCard = profileOrdersPage.orderCard(profileCreatedOrder._id);

    await expect(doneCard.getByText('#034536')).toBeVisible();
    await expect(doneCard.getByText('Выполнен')).toBeVisible();
    await expect(pendingCard.getByText('#034500')).toBeVisible();
    await expect(pendingCard.getByText('Готовится')).toBeVisible();
    await expect(createdCard.getByText('#034400')).toBeVisible();
    await expect(createdCard.getByText('Создан')).toBeVisible();
    await expect(profileOrdersPage.hint).toBeVisible();
  });

  test('клик по заказу открывает модалку поверх истории', async ({
    page,
    profileOrdersPage,
  }): Promise<void> => {
    await mockProfileOrdersSocket(page);
    await profileOrdersPage.goto();
    await profileOrdersPage.openOrder(profileDoneOrder._id);

    await expect(page).toHaveURL(new RegExp(`/profile/orders/${profileDoneOrder._id}`));
    await expect(profileOrdersPage.modal).toBeVisible();
    await expect(profileOrdersPage.modal.getByText('#034536')).toBeVisible();
    await expect(profileOrdersPage.modal.getByText(profileDoneOrder.name)).toBeVisible();
    await expect(profileOrdersPage.modal.getByText('Выполнен')).toBeVisible();
    await expect(profileOrdersPage.historyLink).toBeVisible();
  });

  test('после Invalid or missing token обновляет токен и подключается снова', async ({
    page,
    profileOrdersPage,
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

    const refreshRequest = profileOrdersPage.waitForTokenRefresh();

    await profileOrdersPage.open('/profile/orders');

    const request = await refreshRequest;
    expect(request.postDataJSON()).toEqual({ token: SEEDED_REFRESH_TOKEN });

    await profileOrdersPage.orderCard(profileDoneOrder._id).waitFor();

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
