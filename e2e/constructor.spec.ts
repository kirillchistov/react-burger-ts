import { expect, test } from '@playwright/test';

import { bun, ORDER_NUMBER, sauce } from './fixtures/ingredients';
import { mockBurgerApi, openConstructor, seedAuth } from './helpers/app';
import { dragHtml5 } from './helpers/dnd';

test.describe('Конструктор', (): void => {
  test.beforeEach(async ({ page }): Promise<void> => {
    await mockBurgerApi(page);
  });

  test('собирает бургер перетаскиванием и показывает номер заказа в модалке без логина', async ({
    page,
  }): Promise<void> => {
    await seedAuth(page);
    await openConstructor(page);

    const constructor = page.getByTestId('burger-constructor');

    await dragHtml5(page.getByTestId(`ingredient-${bun._id}`), constructor);
    await dragHtml5(page.getByTestId(`ingredient-${sauce._id}`), constructor);

    await expect(constructor.getByText(`${bun.name} (верх)`)).toBeVisible();
    await expect(constructor.getByText(`${bun.name} (низ)`)).toBeVisible();
    await expect(constructor.getByText(sauce.name)).toBeVisible();
    await expect(page.getByText('2600')).toBeVisible();

    const orderRequest = page.waitForRequest(
      (request) => request.url().includes('/api/orders') && request.method() === 'POST'
    );

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const request = await orderRequest;
    expect(request.postDataJSON()).toEqual({
      ingredients: [bun._id, sauce._id, bun._id],
    });
    expect(page.url()).not.toContain('/login');

    const modal = page.getByRole('dialog');
    await expect(modal.getByText(String(ORDER_NUMBER))).toBeVisible();
    await expect(modal.getByText('идентификатор заказа')).toBeVisible();
    await expect(modal.getByText('Ваш заказ начали готовить')).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();
    await expect(modal).toHaveCount(0);
    await expect(page.getByText('Выберите булки').first()).toBeVisible();
    await expect(page.getByText('Выберите начинку')).toBeVisible();
  });

  test('открывает модалку ингредиента и закрывает её крестиком', async ({
    page,
  }): Promise<void> => {
    await openConstructor(page);

    await page.getByTestId(`ingredient-${bun._id}`).click();

    const modal = page.getByRole('dialog');
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByText(bun.name)).toBeVisible();
    await expect(modal.getByText('Калории, ккал')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/ingredients/${bun._id}`));

    await modal.getByRole('button', { name: 'Закрыть' }).click();
    await expect(modal).toHaveCount(0);
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Соберите бургер')).toBeVisible();
  });

  test('закрывает модалку ингредиента по оверлею и по Escape', async ({
    page,
  }): Promise<void> => {
    await openConstructor(page);

    await page.getByTestId(`ingredient-${sauce._id}`).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByTestId('modal-overlay').click({ position: { x: 8, y: 8 } });
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.getByTestId(`ingredient-${sauce._id}`).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('гость при оформлении заказа уходит на логин, не оформляя заказ', async ({
    page,
  }): Promise<void> => {
    await openConstructor(page);

    await dragHtml5(
      page.getByTestId(`ingredient-${bun._id}`),
      page.getByTestId('burger-constructor')
    );
    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
  });
});
