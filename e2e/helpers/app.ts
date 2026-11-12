import { bun, ingredients, mockUser, ORDER_NUMBER } from '../fixtures/ingredients';

import type { Page } from '@playwright/test';

export const mockBurgerApi = async (page: Page): Promise<void> => {
  await page.route('**/api/ingredients', async (route): Promise<void> => {
    await route.fulfill({
      json: { data: ingredients, success: true },
    });
  });

  await page.route('**/api/auth/user', async (route): Promise<void> => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }

    await route.fulfill({
      json: { success: true, user: mockUser },
    });
  });

  await page.route('**/api/orders', async (route): Promise<void> => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await route.fulfill({
      json: {
        name: 'Краторный spicy бургер',
        order: { number: ORDER_NUMBER },
        success: true,
      },
    });
  });
};

export const seedAuth = async (page: Page): Promise<void> => {
  await page.addInitScript((): void => {
    localStorage.setItem('accessToken', 'Bearer test-access-token');
    localStorage.setItem('refreshToken', 'test-refresh-token');
  });
};

export const openConstructor = async (page: Page): Promise<void> => {
  await page.goto('/');
  await page.getByTestId(`ingredient-${bun._id}`).waitFor();
};
