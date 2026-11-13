import { expect, test } from '@playwright/test';

import { bun, main, ORDER_NUMBER, sauce } from './fixtures/ingredients';
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

  test('без булки кнопка заказа неактивна', async ({ page }): Promise<void> => {
    await openConstructor(page);

    const orderButton = page.getByRole('button', { name: 'Оформить заказ' });
    await expect(orderButton).toBeDisabled();

    await dragHtml5(
      page.getByTestId(`ingredient-${sauce._id}`),
      page.getByTestId('burger-constructor')
    );
    await expect(orderButton).toBeDisabled();

    await dragHtml5(
      page.getByTestId(`ingredient-${bun._id}`),
      page.getByTestId('burger-constructor')
    );
    await expect(orderButton).toBeEnabled();
  });

  test('счётчик на карточке растёт, крестик убирает начинку', async ({
    page,
  }): Promise<void> => {
    await openConstructor(page);
    const constructor = page.getByTestId('burger-constructor');
    const sauceCard = page.getByTestId(`ingredient-${sauce._id}`);
    const bunCard = page.getByTestId(`ingredient-${bun._id}`);

    await expect(sauceCard.locator('.counter__num')).toHaveCount(0);

    await dragHtml5(bunCard, constructor);
    await expect(bunCard.locator('.counter__num')).toHaveText('2');

    await dragHtml5(sauceCard, constructor);
    await dragHtml5(sauceCard, constructor);
    await expect(sauceCard.locator('.counter__num')).toHaveText('2');
    await expect(constructor.getByText(sauce.name)).toHaveCount(2);

    await page
      .getByTestId(`constructor-filling-${sauce._id}`)
      .first()
      .locator('.constructor-element__action')
      .click();

    await expect(constructor.getByText(sauce.name)).toHaveCount(1);
    await expect(sauceCard.locator('.counter__num')).toHaveText('1');

    await page
      .getByTestId(`constructor-filling-${sauce._id}`)
      .locator('.constructor-element__action')
      .click();

    await expect(constructor.getByText('Выберите начинку')).toBeVisible();
    await expect(sauceCard.locator('.counter__num')).toHaveCount(0);
  });

  test('меняет порядок начинок перетаскиванием', async ({ page }): Promise<void> => {
    await openConstructor(page);
    const constructor = page.getByTestId('burger-constructor');

    await dragHtml5(page.getByTestId(`ingredient-${sauce._id}`), constructor);
    await dragHtml5(page.getByTestId(`ingredient-${main._id}`), constructor);

    const fillings = constructor.locator('ul li');
    await expect(fillings.nth(0)).toContainText(sauce.name);
    await expect(fillings.nth(1)).toContainText(main.name);

    await dragHtml5(
      page.getByTestId(`constructor-filling-${main._id}`),
      page.getByTestId(`constructor-filling-${sauce._id}`)
    );

    await expect(fillings.nth(0)).toContainText(main.name);
    await expect(fillings.nth(1)).toContainText(sauce.name);
  });

  test('пока заказ создаётся, в модалке виден прелоадер', async ({
    page,
  }): Promise<void> => {
    await seedAuth(page);
    let release: () => void = (): void => undefined;
    const hold = new Promise<void>((resolve) => {
      release = resolve;
    });

    await page.route('**/api/orders', async (route): Promise<void> => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      await hold;
      await route.fulfill({
        json: {
          name: 'Краторный spicy бургер',
          order: { number: ORDER_NUMBER },
          success: true,
        },
      });
    });

    await openConstructor(page);
    const constructor = page.getByTestId('burger-constructor');
    await dragHtml5(page.getByTestId(`ingredient-${bun._id}`), constructor);
    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('order-preloader')).toBeVisible();
    await expect(modal.getByText('идентификатор заказа')).toHaveCount(0);

    release();

    await expect(modal.getByText(String(ORDER_NUMBER))).toBeVisible();
    await expect(page.getByTestId('order-preloader')).toHaveCount(0);
  });

  test('ошибка оформления заказа показывается в модалке и не чистит конструктор', async ({
    page,
  }): Promise<void> => {
    await seedAuth(page);
    await page.route('**/api/orders', async (route): Promise<void> => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      await route.fulfill({
        json: { message: 'кухня закрыта', success: false },
        status: 500,
      });
    });

    await openConstructor(page);
    const constructor = page.getByTestId('burger-constructor');
    await dragHtml5(page.getByTestId(`ingredient-${bun._id}`), constructor);
    await dragHtml5(page.getByTestId(`ingredient-${sauce._id}`), constructor);
    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const modal = page.getByRole('dialog');
    await expect(modal.getByText('кухня закрыта')).toBeVisible();
    await expect(modal.getByText('идентификатор заказа')).toHaveCount(0);
    await expect(constructor.getByText(`${bun.name} (верх)`)).toBeVisible();
    await expect(constructor.getByText(sauce.name)).toBeVisible();
  });
});
