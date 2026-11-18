import { mockUser } from './fixtures/ingredients';
import { homeUrlPattern, mockBurgerApi } from './helpers/app';
import {
  AUTH_ACCESS_TOKEN,
  AUTH_PASSWORD,
  AUTH_REFRESH_TOKEN,
  AUTH_RESET_CODE,
  mockAuthApi,
} from './helpers/auth';
import { expect, test } from './test';

test.describe('Авторизация', (): void => {
  test.beforeEach(async ({ page }): Promise<void> => {
    await mockBurgerApi(page);
    await mockAuthApi(page);
  });

  test('логин отправляет почту и пароль и пускает на конструктор', async ({
    homePage,
    loginPage,
    page,
  }): Promise<void> => {
    await loginPage.goto();

    const request = await loginPage.submitLogin(mockUser.email, AUTH_PASSWORD);

    expect(request.postDataJSON()).toEqual({
      email: mockUser.email,
      password: AUTH_PASSWORD,
    });

    await expect(page).toHaveURL(homeUrlPattern);
    await expect(homePage.title).toBeVisible();
    expect(await loginPage.storageItem('accessToken')).toBe(AUTH_ACCESS_TOKEN);
    expect(await loginPage.storageItem('refreshToken')).toBe(AUTH_REFRESH_TOKEN);
  });

  test('регистрация отправляет имя, почту и пароль', async ({
    homePage,
    page,
    registerPage,
  }): Promise<void> => {
    await registerPage.goto();

    const request = await registerPage.submitRegister(
      mockUser.name,
      mockUser.email,
      AUTH_PASSWORD
    );

    expect(request.postDataJSON()).toEqual({
      email: mockUser.email,
      name: mockUser.name,
      password: AUTH_PASSWORD,
    });

    await expect(page).toHaveURL(homeUrlPattern);
    await expect(homePage.title).toBeVisible();
  });

  test('восстановление пароля ставит флаг, открывает сброс и после успеха ведёт на логин', async ({
    forgotPasswordPage,
    loginPage,
    page,
    resetPasswordPage,
  }): Promise<void> => {
    await forgotPasswordPage.goto();

    const forgot = await forgotPasswordPage.submitEmail(mockUser.email);

    expect(forgot.postDataJSON()).toEqual({ email: mockUser.email });
    await expect(page).toHaveURL(/\/reset-password/);
    expect(await forgotPasswordPage.storageItem('resetPasswordAllowed')).toBe('true');
    await expect(resetPasswordPage.submit).toBeVisible();

    const reset = await resetPasswordPage.submitReset(AUTH_PASSWORD, AUTH_RESET_CODE);

    expect(reset.postDataJSON()).toEqual({
      password: AUTH_PASSWORD,
      token: AUTH_RESET_CODE,
    });
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.heading).toBeVisible();
    expect(await loginPage.storageItem('resetPasswordAllowed')).toBeNull();
  });
});
