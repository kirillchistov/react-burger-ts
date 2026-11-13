import { expect, test } from '@playwright/test';

import { doneOrder, pendingOrder, remoteOrder } from './fixtures/orders';
import { mockBurgerApi } from './helpers/app';
import { mockFeedSocket, mockOrderById, openFeed } from './helpers/feed';

test.describe('Лента заказов', (): void => {
  test.beforeEach(async ({ page }): Promise<void> => {
    await mockBurgerApi(page);
    await mockFeedSocket(page);
  });

  test('показывает заказы, колонки статусов и счётчики с сокета', async ({
    page,
  }): Promise<void> => {
    await openFeed(page);

    await expect(page.getByTestId(`order-${doneOrder._id}`)).toBeVisible();
    await expect(page.getByTestId(`order-${pendingOrder._id}`)).toBeVisible();
    await expect(page.getByText('#034536')).toBeVisible();
    await expect(page.getByText('#034500')).toBeVisible();

    const ready = page.getByRole('heading', { name: 'Готовы:' }).locator('..');
    const inWork = page.getByRole('heading', { name: 'В работе:' }).locator('..');

    await expect(ready.getByText('034536')).toBeVisible();
    await expect(inWork.getByText('034500')).toBeVisible();

    const allTime = page.getByRole('heading', { name: 'Выполнено за все время:' });
    const today = page.getByRole('heading', { name: 'Выполнено за сегодня:' });

    await expect(allTime).toBeVisible();
    await expect(allTime.locator('..').getByText('2231', { exact: true })).toBeVisible();
    await expect(today).toBeVisible();
    await expect(today.locator('..').getByText('4', { exact: true })).toBeVisible();
  });

  test('клик по заказу открывает модалку поверх ленты без GET /orders/:id', async ({
    page,
  }): Promise<void> => {
    await mockOrderById(page, [doneOrder]);
    await openFeed(page);

    const orderGets: string[] = [];
    page.on('request', (request): void => {
      if (
        request.method() === 'GET' &&
        request.url().includes(`/api/orders/${doneOrder._id}`)
      ) {
        orderGets.push(request.url());
      }
    });

    await page.getByTestId(`order-${doneOrder._id}`).click();

    await expect(page).toHaveURL(new RegExp(`/feed/${doneOrder._id}`));
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('#034536')).toBeVisible();
    await expect(modal.getByText(doneOrder.name)).toBeVisible();
    await expect(modal.getByText('Выполнен')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Лента заказов' })).toBeVisible();
    expect(orderGets).toEqual([]);
  });

  test('прямой заход открывает страницу заказа и запрашивает GET /orders/:id', async ({
    page,
  }): Promise<void> => {
    await mockOrderById(page, [remoteOrder]);

    const orderRequest = page.waitForRequest(
      (request) =>
        request.method() === 'GET' &&
        request.url().includes(`/api/orders/${remoteOrder._id}`)
    );

    await page.goto(`/feed/${remoteOrder._id}`);

    await orderRequest;
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('#099999')).toBeVisible();
    await expect(page.getByText(remoteOrder.name)).toBeVisible();
    await expect(page.getByText('Выполнен')).toBeVisible();
    await expect(page.getByText('Состав:')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Лента заказов' })).toHaveCount(0);
  });
});
