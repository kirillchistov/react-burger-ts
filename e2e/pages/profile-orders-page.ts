import { profileDoneOrder } from '../fixtures/orders';
import { BasePage } from './base-page';

import type { Locator, Request } from '@playwright/test';

export class ProfileOrdersPage extends BasePage {
  readonly hint: Locator;
  readonly historyLink: Locator;

  constructor(page: BasePage['page']) {
    super(page);
    this.hint = page.getByText(
      'В этом разделе вы можете просмотреть свою историю заказов'
    );
    this.historyLink = page.getByRole('link', { name: 'История заказов' });
  }

  orderCard(id: string): Locator {
    return this.page.getByTestId(`order-${id}`);
  }

  async goto(): Promise<void> {
    await this.open('/profile/orders');
    await this.orderCard(profileDoneOrder._id).waitFor();
  }

  async openOrder(id: string): Promise<void> {
    await this.orderCard(id).click();
  }

  waitForTokenRefresh(): Promise<Request> {
    return this.page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().includes('/api/auth/token')
    );
  }
}
