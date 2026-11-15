import { bun } from './fixtures/ingredients';
import { homeUrlPattern, mockBurgerApi } from './helpers/app';
import { expect, test } from './test';

test.describe('Навигация', (): void => {
  test.beforeEach(async ({ page }): Promise<void> => {
    await mockBurgerApi(page);
  });

  test('прямой заход на ингредиент открывает страницу, а не модалку', async ({
    ingredientPage,
  }): Promise<void> => {
    await ingredientPage.goto(bun._id);

    await expect(ingredientPage.heading).toBeVisible();
    await expect(ingredientPage.page.getByText(bun.name)).toBeVisible();
    await expect(ingredientPage.modal).toHaveCount(0);
  });

  test('из шапки открывается лента заказов', async ({
    homePage,
    page,
  }): Promise<void> => {
    await homePage.goto();
    await homePage.feedLink.click();
    await expect(page).toHaveURL(/\/feed/);
  });

  test('гость с /profile попадает на логин', async ({
    loginPage,
    page,
    profilePage,
  }): Promise<void> => {
    await profilePage.open('/profile');

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.heading).toBeVisible();
  });

  test('сброс пароля без флага уводит на забыли пароль', async ({
    forgotPasswordPage,
    page,
    resetPasswordPage,
  }): Promise<void> => {
    await resetPasswordPage.goto();

    await expect(page).toHaveURL(/\/forgot-password/);
    await expect(forgotPasswordPage.heading).toBeVisible();
    await expect(forgotPasswordPage.submit).toBeVisible();
  });

  test('неизвестный путь показывает 404', async ({
    homePage,
    notFoundPage,
    page,
  }): Promise<void> => {
    await notFoundPage.goto();

    await expect(notFoundPage.title).toBeVisible();
    await notFoundPage.homeLink.click();
    await expect(page).toHaveURL(homeUrlPattern);
    await expect(homePage.title).toBeVisible();
  });
});
