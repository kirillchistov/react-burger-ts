import { expect, test } from '@playwright/test';

import { bun } from './fixtures/ingredients';
import { mockBurgerApi, openConstructor } from './helpers/app';

test.describe('Навигация', (): void => {
  test.beforeEach(async ({ page }): Promise<void> => {
    await mockBurgerApi(page);
  });

  test('прямой заход на ингредиент открывает страницу, а не модалку', async ({
    page,
  }): Promise<void> => {
    await page.goto(`/ingredients/${bun._id}`);

    await expect(
      page.getByRole('heading', { name: 'Детали ингредиента' })
    ).toBeVisible();
    await expect(page.getByText(bun.name)).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('из шапки открывается лента заказов', async ({ page }): Promise<void> => {
    await openConstructor(page);

    await page.getByRole('link', { name: 'Лента заказов' }).click();
    await expect(page).toHaveURL(/\/feed/);
  });

  test('гость с /profile попадает на логин', async ({ page }): Promise<void> => {
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
  });

  test('неизвестный путь показывает 404', async ({ page }): Promise<void> => {
    await page.goto('/no-such-page');

    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Страница не найдена')).toBeVisible();

    await page.getByRole('link', { name: 'Вернуться на главную' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Соберите бургер')).toBeVisible();
  });
});
