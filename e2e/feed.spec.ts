import { doneOrder, pendingOrder, remoteOrder } from './fixtures/orders';
import { mockBurgerApi } from './helpers/app';
import { mockFeedSocket, mockOrderById } from './helpers/feed';
import { expect, test } from './test';

test.describe('Лента заказов', (): void => {
  test.beforeEach(async ({ page }): Promise<void> => {
    await mockBurgerApi(page);
    await mockFeedSocket(page);
  });

  test('показывает заказы, колонки статусов и счётчики с сокета', async ({
    feedPage,
  }): Promise<void> => {
    await feedPage.goto();

    await expect(feedPage.orderCard(doneOrder._id)).toBeVisible();
    await expect(feedPage.orderCard(pendingOrder._id)).toBeVisible();
    await expect(feedPage.page.getByText('#034536')).toBeVisible();
    await expect(feedPage.page.getByText('#034500')).toBeVisible();

    await expect(feedPage.ready.getByText('034536')).toBeVisible();
    await expect(feedPage.inWork.getByText('034500')).toBeVisible();

    await expect(feedPage.allTime).toBeVisible();
    await expect(
      feedPage.allTime.locator('..').getByText('2231', { exact: true })
    ).toBeVisible();
    await expect(feedPage.today).toBeVisible();
    await expect(
      feedPage.today.locator('..').getByText('4', { exact: true })
    ).toBeVisible();
  });

  test('клик по заказу открывает модалку поверх ленты без GET /orders/:id', async ({
    feedPage,
    page,
  }): Promise<void> => {
    await mockOrderById(page, [doneOrder]);
    await feedPage.goto();

    const orderGets: string[] = [];
    page.on('request', (request): void => {
      if (
        request.method() === 'GET' &&
        request.url().includes(`/api/orders/${doneOrder._id}`)
      ) {
        orderGets.push(request.url());
      }
    });

    await feedPage.openOrder(doneOrder._id);

    await expect(page).toHaveURL(new RegExp(`/feed/${doneOrder._id}`));
    await expect(feedPage.modal).toBeVisible();
    await expect(feedPage.modal.getByText('#034536')).toBeVisible();
    await expect(feedPage.modal.getByText(doneOrder.name)).toBeVisible();
    await expect(feedPage.modal.getByText('Выполнен')).toBeVisible();
    await expect(feedPage.heading).toBeVisible();
    expect(orderGets).toEqual([]);
  });

  test('прямой заход открывает страницу заказа и запрашивает GET /orders/:id', async ({
    feedPage,
    orderPage,
    page,
  }): Promise<void> => {
    await mockOrderById(page, [remoteOrder]);

    const orderRequest = orderPage.waitForOrderGet(remoteOrder._id);

    await orderPage.gotoFeedOrder(remoteOrder._id);

    await orderRequest;
    await expect(orderPage.modal).toHaveCount(0);
    await expect(page.getByText('#099999')).toBeVisible();
    await expect(page.getByText(remoteOrder.name)).toBeVisible();
    await expect(page.getByText('Выполнен')).toBeVisible();
    await expect(orderPage.composition).toBeVisible();
    await expect(feedPage.heading).toHaveCount(0);
  });
});
