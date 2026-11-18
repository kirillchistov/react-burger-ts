import { BasePage } from './base-page';

import type { Locator } from '@playwright/test';

export class FeedPage extends BasePage {
  readonly allTime: Locator;
  readonly heading: Locator;
  readonly inWork: Locator;
  readonly ready: Locator;
  readonly today: Locator;

  constructor(page: BasePage['page']) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Лента заказов' });
    this.ready = page.getByRole('heading', { name: 'Готовы:' }).locator('..');
    this.inWork = page.getByRole('heading', { name: 'В работе:' }).locator('..');
    this.allTime = page.getByRole('heading', { name: 'Выполнено за все время:' });
    this.today = page.getByRole('heading', { name: 'Выполнено за сегодня:' });
  }

  orderCard(id: string): Locator {
    return this.page.getByTestId(`order-${id}`);
  }

  async goto(): Promise<void> {
    await this.open('/feed');
    await this.heading.waitFor();
  }

  async openOrder(id: string): Promise<void> {
    await this.orderCard(id).click();
  }
}
