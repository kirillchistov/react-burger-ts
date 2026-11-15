import { expect } from '@playwright/test';

import { BasePage } from './base-page';

import type { Locator, Request } from '@playwright/test';

export class LoginPage extends BasePage {
  readonly heading: Locator;
  readonly submit: Locator;

  constructor(page: BasePage['page']) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Вход' });
    this.submit = page.getByRole('button', { name: 'Войти' });
  }

  async goto(): Promise<void> {
    await this.open('/login');
    await expect(this.heading).toBeVisible();
  }

  async submitLogin(email: string, password: string): Promise<Request> {
    await this.fillField('email', email);
    await this.fillField('password', password);

    const pending = this.page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().includes('/api/auth/login')
    );

    await this.submit.click();

    return pending;
  }
}

export class RegisterPage extends BasePage {
  readonly heading: Locator;
  readonly submit: Locator;

  constructor(page: BasePage['page']) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Регистрация' });
    this.submit = page.getByRole('button', { name: 'Зарегистрироваться' });
  }

  async goto(): Promise<void> {
    await this.open('/register');
    await expect(this.heading).toBeVisible();
  }

  async submitRegister(name: string, email: string, password: string): Promise<Request> {
    await this.fillField('name', name);
    await this.fillField('email', email);
    await this.fillField('password', password);

    const pending = this.page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().includes('/api/auth/register')
    );

    await this.submit.click();

    return pending;
  }
}

export class ForgotPasswordPage extends BasePage {
  readonly heading: Locator;
  readonly submit: Locator;

  constructor(page: BasePage['page']) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Восстановление пароля' });
    this.submit = page.getByRole('button', { name: 'Восстановить' });
  }

  async goto(): Promise<void> {
    await this.open('/forgot-password');
    await expect(this.heading).toBeVisible();
  }

  async submitEmail(email: string): Promise<Request> {
    await this.fillField('email', email);

    const pending = this.page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().endsWith('/api/password-reset')
    );

    await this.submit.click();

    return pending;
  }
}

export class ResetPasswordPage extends BasePage {
  readonly submit: Locator;

  constructor(page: BasePage['page']) {
    super(page);
    this.submit = page.getByRole('button', { name: 'Сохранить' });
  }

  async goto(): Promise<void> {
    await this.open('/reset-password');
  }

  async submitReset(password: string, token: string): Promise<Request> {
    await this.fillField('password', password);
    await this.fillField('token', token);

    const pending = this.page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        request.url().includes('/api/password-reset/reset')
    );

    await this.submit.click();

    return pending;
  }
}
