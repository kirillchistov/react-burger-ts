import { mockUser } from '../fixtures/ingredients';

import type { Page } from '@playwright/test';

export const AUTH_PASSWORD = 'secret123';
export const AUTH_RESET_CODE = 'reset-code';
export const AUTH_ACCESS_TOKEN = 'Bearer test-access-token';
export const AUTH_REFRESH_TOKEN = 'test-refresh-token';

const authTokens = {
  accessToken: AUTH_ACCESS_TOKEN,
  refreshToken: AUTH_REFRESH_TOKEN,
  success: true as const,
  user: mockUser,
};

export const mockAuthApi = async (page: Page): Promise<void> => {
  await page.route('**/api/auth/login', async (route): Promise<void> => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await route.fulfill({ json: authTokens });
  });

  await page.route('**/api/auth/register', async (route): Promise<void> => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await route.fulfill({ json: authTokens });
  });

  await page.route('**/api/auth/logout', async (route): Promise<void> => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await route.fulfill({ json: { message: 'ok', success: true } });
  });

  await page.route('**/api/password-reset/reset', async (route): Promise<void> => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await route.fulfill({ json: { message: 'ok', success: true } });
  });

  await page.route('**/api/password-reset', async (route): Promise<void> => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await route.fulfill({ json: { message: 'ok', success: true } });
  });
};

export const fillByName = async (
  page: Page,
  name: string,
  value: string
): Promise<void> => {
  await page.locator(`input[name="${name}"]`).fill(value);
};
