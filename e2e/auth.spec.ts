import { expect, test } from '@playwright/test';

import { mockUser } from './fixtures/ingredients';
import { mockBurgerApi } from './helpers/app';
import {
  AUTH_ACCESS_TOKEN,
  AUTH_PASSWORD,
  AUTH_REFRESH_TOKEN,
  AUTH_RESET_CODE,
  fillByName,
  mockAuthApi,
} from './helpers/auth';

test.describe('Авторизация', (): void => {
  test.beforeEach(async ({ page }): Promise<void> => {
    await mockBurgerApi(page);
    await mockAuthApi(page);
  });

  test('логин отправляет почту и пароль и пускает на конструктор', async ({
    page,
  }): Promise<void> => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();

    await fillByName(page, 'email', mockUser.email);
    await fillByName(page, 'password', AUTH_PASSWORD);

    const loginRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().includes('/api/auth/login')
    );

    await page.getByRole('button', { name: 'Войти' }).click();

    const request = await loginRequest;
    expect(request.postDataJSON()).toEqual({
      email: mockUser.email,
      password: AUTH_PASSWORD,
    });

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Соберите бургер')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('accessToken'))).toBe(
      AUTH_ACCESS_TOKEN
    );
    expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBe(
      AUTH_REFRESH_TOKEN
    );
  });

  test('регистрация отправляет имя, почту и пароль', async ({ page }): Promise<void> => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Регистрация' })).toBeVisible();

    await fillByName(page, 'name', mockUser.name);
    await fillByName(page, 'email', mockUser.email);
    await fillByName(page, 'password', AUTH_PASSWORD);

    const registerRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().includes('/api/auth/register')
    );

    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

    const request = await registerRequest;
    expect(request.postDataJSON()).toEqual({
      email: mockUser.email,
      name: mockUser.name,
      password: AUTH_PASSWORD,
    });

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Соберите бургер')).toBeVisible();
  });

  test('восстановление пароля ставит флаг, открывает сброс и после успеха ведёт на логин', async ({
    page,
  }): Promise<void> => {
    await page.goto('/forgot-password');
    await expect(
      page.getByRole('heading', { name: 'Восстановление пароля' })
    ).toBeVisible();

    await fillByName(page, 'email', mockUser.email);

    const forgotRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().endsWith('/api/password-reset')
    );

    await page.getByRole('button', { name: 'Восстановить' }).click();

    const forgot = await forgotRequest;
    expect(forgot.postDataJSON()).toEqual({ email: mockUser.email });

    await expect(page).toHaveURL(/\/reset-password/);
    expect(await page.evaluate(() => localStorage.getItem('resetPasswordAllowed'))).toBe(
      'true'
    );
    await expect(page.getByRole('button', { name: 'Сохранить' })).toBeVisible();

    await fillByName(page, 'password', AUTH_PASSWORD);
    await fillByName(page, 'token', AUTH_RESET_CODE);

    const resetRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        request.url().includes('/api/password-reset/reset')
    );

    await page.getByRole('button', { name: 'Сохранить' }).click();

    const reset = await resetRequest;
    expect(reset.postDataJSON()).toEqual({
      password: AUTH_PASSWORD,
      token: AUTH_RESET_CODE,
    });

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem('resetPasswordAllowed'))
    ).toBeNull();
  });
});
