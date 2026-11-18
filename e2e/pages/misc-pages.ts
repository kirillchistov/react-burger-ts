import { expect } from '@playwright/test';

import { BasePage } from './base-page';

import type { Locator, Request } from '@playwright/test';

export class IngredientPage extends BasePage {
  readonly heading: Locator;

  constructor(page: BasePage['page']) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Детали ингредиента' });
  }

  async goto(id: string): Promise<void> {
    await this.open(`/ingredients/${id}`);
  }
}

export class OrderPage extends BasePage {
  readonly composition: Locator;

  constructor(page: BasePage['page']) {
    super(page);
    this.composition = page.getByText('Состав:');
  }

  async gotoFeedOrder(id: string): Promise<void> {
    await this.open(`/feed/${id}`);
  }

  waitForOrderGet(id: string): Promise<Request> {
    return this.page.waitForRequest(
      (request) =>
        request.method() === 'GET' && request.url().includes(`/api/orders/${id}`)
    );
  }
}

export class NotFoundPage extends BasePage {
  readonly code: Locator;
  readonly homeLink: Locator;
  readonly title: Locator;

  constructor(page: BasePage['page']) {
    super(page);
    this.code = page.getByText('404');
    this.homeLink = page.getByRole('link', { name: 'Вернуться на главную' });
    this.title = page.getByText('Страница не найдена');
  }

  async goto(): Promise<void> {
    await this.open('/no-such-page');
    await expect(this.code).toBeVisible();
  }
}
