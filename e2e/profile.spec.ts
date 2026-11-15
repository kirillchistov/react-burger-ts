import { mockUser } from './fixtures/ingredients';
import { mockBurgerApi, seedAuth } from './helpers/app';
import { AUTH_PASSWORD, mockAuthApi } from './helpers/auth';
import { expect, test } from './test';

test.describe('Профиль', (): void => {
  test.beforeEach(async ({ page, profilePage }): Promise<void> => {
    await mockBurgerApi(page);
    await mockAuthApi(page);
    await seedAuth(page);
    await profilePage.goto();
  });

  test('отмена возвращает поля, сохранение шлёт PATCH без пустого пароля', async ({
    profilePage,
  }): Promise<void> => {
    await expect(profilePage.save).toHaveCount(0);

    await profilePage.fillField('name', 'Кирилл');
    await expect(profilePage.cancel).toBeVisible();
    await profilePage.cancel.click();
    await expect(profilePage.field('name')).toHaveValue(mockUser.name);
    await expect(profilePage.save).toHaveCount(0);

    await profilePage.fillField('name', 'Кирилл');
    const withoutPassword = await profilePage.saveProfile();

    expect(withoutPassword.postDataJSON()).toEqual({
      email: mockUser.email,
      name: 'Кирилл',
    });
    await expect(profilePage.field('name')).toHaveValue('Кирилл');
    await expect(profilePage.save).toHaveCount(0);

    await profilePage.fillField('password', AUTH_PASSWORD);
    const withPassword = await profilePage.saveProfile();

    expect(withPassword.postDataJSON()).toEqual({
      email: mockUser.email,
      name: 'Кирилл',
      password: AUTH_PASSWORD,
    });
  });

  test('выход очищает токены и открывает логин', async ({
    loginPage,
    page,
    profilePage,
  }): Promise<void> => {
    const request = await profilePage.submitLogout();

    expect(request.postDataJSON()).toEqual({ token: 'test-refresh-token' });
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.heading).toBeVisible();
    expect(await profilePage.storageItem('accessToken')).toBeNull();
    expect(await profilePage.storageItem('refreshToken')).toBeNull();
  });
});
