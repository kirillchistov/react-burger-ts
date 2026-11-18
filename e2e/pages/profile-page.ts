import { expect } from '@playwright/test';

import { mockUser } from '../fixtures/ingredients';
import { BasePage } from './base-page';

import type { Locator, Request } from '@playwright/test';

export class ProfilePage extends BasePage {
  readonly cancel: Locator;
  readonly historyLink: Locator;
  readonly logout: Locator;
  readonly save: Locator;

  constructor(page: BasePage['page']) {
    super(page);
    this.cancel = page.getByRole('button', { name: 'Отмена' });
    this.historyLink = page.getByRole('link', { name: 'История заказов' });
    this.logout = page.getByRole('button', { name: 'Выход' });
    this.save = page.getByRole('button', { name: 'Сохранить' });
  }

  async goto(): Promise<void> {
    await this.open('/profile');
    await expect(this.field('name')).toHaveValue(mockUser.name);
  }

  async saveProfile(): Promise<Request> {
    const pending = this.page.waitForRequest(
      (request) =>
        request.method() === 'PATCH' && request.url().includes('/api/auth/user')
    );

    await this.save.click();

    return pending;
  }

  async submitLogout(): Promise<Request> {
    const pending = this.page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().includes('/api/auth/logout')
    );

    await this.logout.click();

    return pending;
  }
}
