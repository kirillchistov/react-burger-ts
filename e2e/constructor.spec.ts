import { bun, main, ORDER_NUMBER, sauce } from './fixtures/ingredients';
import { homeUrlPattern, mockBurgerApi, seedAuth } from './helpers/app';
import { expect, test } from './test';

test.describe('Конструктор', (): void => {
  test.beforeEach(async ({ page }): Promise<void> => {
    await mockBurgerApi(page);
  });

  test('собирает бургер перетаскиванием и показывает номер заказа в модалке без логина', async ({
    homePage,
    page,
  }): Promise<void> => {
    await seedAuth(page);
    await homePage.goto();

    await homePage.addIngredient(bun._id);
    await homePage.addIngredient(sauce._id);

    await expect(
      homePage.constructorPanel.getByText(`${bun.name} (верх)`)
    ).toBeVisible();
    await expect(homePage.constructorPanel.getByText(`${bun.name} (низ)`)).toBeVisible();
    await expect(homePage.constructorPanel.getByText(sauce.name)).toBeVisible();
    await expect(page.getByText('2600')).toBeVisible();

    const request = await homePage.submitOrder();

    expect(request.postDataJSON()).toEqual({
      ingredients: [bun._id, sauce._id, bun._id],
    });
    expect(page.url()).not.toContain('/login');

    await expect(homePage.modal.getByText(String(ORDER_NUMBER))).toBeVisible();
    await expect(homePage.modal.getByText('идентификатор заказа')).toBeVisible();
    await expect(homePage.modal.getByText('Ваш заказ начали готовить')).toBeVisible();

    await homePage.closeModal();
    await expect(homePage.modal).toHaveCount(0);
    await expect(homePage.emptyBunHint).toBeVisible();
    await expect(homePage.emptyFillingHint).toBeVisible();
  });

  test('открывает модалку ингредиента и закрывает её крестиком', async ({
    homePage,
    page,
  }): Promise<void> => {
    await homePage.goto();
    await homePage.ingredient(bun._id).click();

    await expect(homePage.modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(homePage.modal.getByText(bun.name)).toBeVisible();
    await expect(homePage.modal.getByText('Калории, ккал')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/ingredients/${bun._id}`));

    await homePage.closeModal();
    await expect(homePage.modal).toHaveCount(0);
    await expect(page).toHaveURL(homeUrlPattern);
    await expect(homePage.title).toBeVisible();
  });

  test('закрывает модалку ингредиента по оверлею и по Escape', async ({
    homePage,
  }): Promise<void> => {
    await homePage.goto();

    await homePage.ingredient(sauce._id).click();
    await expect(homePage.modal).toBeVisible();
    await homePage.closeModalByOverlay();
    await expect(homePage.modal).toHaveCount(0);

    await homePage.ingredient(sauce._id).click();
    await expect(homePage.modal).toBeVisible();
    await homePage.closeModalByEscape();
    await expect(homePage.modal).toHaveCount(0);
  });

  test('гость при оформлении заказа уходит на логин, не оформляя заказ', async ({
    homePage,
    loginPage,
    page,
  }): Promise<void> => {
    await homePage.goto();
    await homePage.addIngredient(bun._id);
    await homePage.clickOrder();

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.heading).toBeVisible();
  });

  test('без булки кнопка заказа неактивна', async ({ homePage }): Promise<void> => {
    await homePage.goto();
    await expect(homePage.orderButton).toBeDisabled();

    await homePage.addIngredient(sauce._id);
    await expect(homePage.orderButton).toBeDisabled();

    await homePage.addIngredient(bun._id);
    await expect(homePage.orderButton).toBeEnabled();
  });

  test('счётчик на карточке растёт, крестик убирает начинку', async ({
    homePage,
  }): Promise<void> => {
    await homePage.goto();

    await expect(homePage.counter(sauce._id)).toHaveCount(0);

    await homePage.addIngredient(bun._id);
    await expect(homePage.counter(bun._id)).toHaveText('2');

    await homePage.addIngredient(sauce._id);
    await homePage.addIngredient(sauce._id);
    await expect(homePage.counter(sauce._id)).toHaveText('2');
    await expect(homePage.constructorPanel.getByText(sauce.name)).toHaveCount(2);

    await homePage.removeFirstFilling(sauce._id);
    await expect(homePage.constructorPanel.getByText(sauce.name)).toHaveCount(1);
    await expect(homePage.counter(sauce._id)).toHaveText('1');

    await homePage.removeFilling(sauce._id);
    await expect(homePage.emptyFillingHint).toBeVisible();
    await expect(homePage.counter(sauce._id)).toHaveCount(0);
  });

  test('меняет порядок начинок перетаскиванием', async ({ homePage }): Promise<void> => {
    await homePage.goto();
    await homePage.addIngredient(sauce._id);
    await homePage.addIngredient(main._id);

    await expect(homePage.fillingNames().nth(0)).toContainText(sauce.name);
    await expect(homePage.fillingNames().nth(1)).toContainText(main.name);

    await homePage.sortFilling(main._id, sauce._id);

    await expect(homePage.fillingNames().nth(0)).toContainText(main.name);
    await expect(homePage.fillingNames().nth(1)).toContainText(sauce.name);
  });

  test('пока заказ создаётся, в модалке виден прелоадер', async ({
    homePage,
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

    await homePage.goto();
    await homePage.addIngredient(bun._id);
    await homePage.clickOrder();

    await expect(homePage.modal).toBeVisible();
    await expect(homePage.orderPreloader).toBeVisible();
    await expect(homePage.modal.getByText('идентификатор заказа')).toHaveCount(0);

    release();

    await expect(homePage.modal.getByText(String(ORDER_NUMBER))).toBeVisible();
    await expect(homePage.orderPreloader).toHaveCount(0);
  });

  test('ошибка оформления заказа показывается в модалке и не чистит конструктор', async ({
    homePage,
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

    await homePage.goto();
    await homePage.addIngredient(bun._id);
    await homePage.addIngredient(sauce._id);
    await homePage.clickOrder();

    await expect(homePage.modal.getByText('кухня закрыта')).toBeVisible();
    await expect(homePage.modal.getByText('идентификатор заказа')).toHaveCount(0);
    await expect(
      homePage.constructorPanel.getByText(`${bun.name} (верх)`)
    ).toBeVisible();
    await expect(homePage.constructorPanel.getByText(sauce.name)).toBeVisible();
  });
});
