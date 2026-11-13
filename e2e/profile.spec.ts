import { expect, test } from '@playwright/test';

import { mockUser } from './fixtures/ingredients';
import { gotoRoute, mockBurgerApi, seedAuth } from './helpers/app';
import { AUTH_PASSWORD, fillByName, mockAuthApi } from './helpers/auth';

test.describe('Профиль', (): void => {
  test.beforeEach(async ({ page }): Promise<void> => {
    await mockBurgerApi(page);
    await mockAuthApi(page);
    await seedAuth(page);
    await gotoRoute(page, '/profile');
    await expect(page.locator('input[name="name"]')).toHaveValue(mockUser.name);
  });

  test('отмена возвращает поля, сохранение шлёт PATCH без пустого пароля', async ({
    page,
  }): Promise<void> => {
    await expect(page.getByRole('button', { name: 'Сохранить' })).toHaveCount(0);

    await fillByName(page, 'name', 'Кирилл');
    await expect(page.getByRole('button', { name: 'Отмена' })).toBeVisible();
    await page.getByRole('button', { name: 'Отмена' }).click();
    await expect(page.locator('input[name="name"]')).toHaveValue(mockUser.name);
    await expect(page.getByRole('button', { name: 'Сохранить' })).toHaveCount(0);

    await fillByName(page, 'name', 'Кирилл');
    const patchWithoutPassword = page.waitForRequest(
      (request) =>
        request.method() === 'PATCH' && request.url().includes('/api/auth/user')
    );
    await page.getByRole('button', { name: 'Сохранить' }).click();

    const withoutPassword = await patchWithoutPassword;
    expect(withoutPassword.postDataJSON()).toEqual({
      email: mockUser.email,
      name: 'Кирилл',
    });

    await expect(page.locator('input[name="name"]')).toHaveValue('Кирилл');
    await expect(page.getByRole('button', { name: 'Сохранить' })).toHaveCount(0);

    await fillByName(page, 'password', AUTH_PASSWORD);
    const patchWithPassword = page.waitForRequest(
      (request) =>
        request.method() === 'PATCH' && request.url().includes('/api/auth/user')
    );
    await page.getByRole('button', { name: 'Сохранить' }).click();

    const withPassword = await patchWithPassword;
    expect(withPassword.postDataJSON()).toEqual({
      email: mockUser.email,
      name: 'Кирилл',
      password: AUTH_PASSWORD,
    });
  });

  test('выход очищает токены и открывает логин', async ({ page }): Promise<void> => {
    const logoutRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().includes('/api/auth/logout')
    );

    await page.getByRole('button', { name: 'Выход' }).click();

    const request = await logoutRequest;
    expect(request.postDataJSON()).toEqual({ token: 'test-refresh-token' });
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('accessToken'))).toBeNull();
    expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBeNull();
  });
});
