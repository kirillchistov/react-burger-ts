import { bun } from '../fixtures/ingredients';
import { dragHtml5 } from '../helpers/dnd';
import { BasePage } from './base-page';

import type { Locator, Request } from '@playwright/test';

export class HomePage extends BasePage {
  readonly constructorPanel: Locator;
  readonly emptyBunHint: Locator;
  readonly emptyFillingHint: Locator;
  readonly orderButton: Locator;
  readonly orderPreloader: Locator;
  readonly title: Locator;

  constructor(page: BasePage['page']) {
    super(page);
    this.constructorPanel = page.getByTestId('burger-constructor');
    this.emptyBunHint = page.getByText('Выберите булки').first();
    this.emptyFillingHint = page.getByText('Выберите начинку');
    this.orderButton = page.getByRole('button', { name: 'Оформить заказ' });
    this.orderPreloader = page.getByTestId('order-preloader');
    this.title = page.getByText('Соберите бургер');
  }

  ingredient(id: string): Locator {
    return this.page.getByTestId(`ingredient-${id}`);
  }

  filling(id: string): Locator {
    return this.page.getByTestId(`constructor-filling-${id}`);
  }

  counter(id: string): Locator {
    return this.ingredient(id).locator('.counter__num');
  }

  fillingNames(): Locator {
    return this.constructorPanel.locator('ul li');
  }

  async goto(): Promise<void> {
    await this.open('/');
    await this.ingredient(bun._id).waitFor();
  }

  async addIngredient(id: string): Promise<void> {
    await dragHtml5(this.ingredient(id), this.constructorPanel);
  }

  async sortFilling(sourceId: string, targetId: string): Promise<void> {
    await dragHtml5(this.filling(sourceId), this.filling(targetId));
  }

  async removeFilling(id: string): Promise<void> {
    await this.filling(id).locator('.constructor-element__action').click();
  }

  async removeFirstFilling(id: string): Promise<void> {
    await this.filling(id).first().locator('.constructor-element__action').click();
  }

  async submitOrder(): Promise<Request> {
    const pending = this.page.waitForRequest(
      (request) => request.url().includes('/api/orders') && request.method() === 'POST'
    );

    await this.orderButton.click();

    return pending;
  }

  async clickOrder(): Promise<void> {
    await this.orderButton.click();
  }
}
