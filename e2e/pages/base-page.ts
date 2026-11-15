import { gotoRoute } from '../helpers/app';

import type { Locator, Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly constructorLink: Locator;
  readonly feedLink: Locator;
  readonly modal: Locator;
  readonly modalClose: Locator;
  readonly overlay: Locator;
  readonly profileLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.constructorLink = page.getByRole('link', { name: 'Конструктор' });
    this.feedLink = page.getByRole('link', { name: 'Лента заказов' });
    this.profileLink = page.getByRole('link', { name: 'Личный кабинет' });
    this.modal = page.getByRole('dialog');
    this.modalClose = this.modal.getByRole('button', { name: 'Закрыть' });
    this.overlay = page.getByTestId('modal-overlay');
  }

  async open(pathname: string): Promise<void> {
    await gotoRoute(this.page, pathname);
  }

  field(name: string): Locator {
    return this.page.locator(`input[name="${name}"]`);
  }

  async fillField(name: string, value: string): Promise<void> {
    await this.field(name).fill(value);
  }

  async closeModal(): Promise<void> {
    await this.modalClose.click();
  }

  async closeModalByOverlay(): Promise<void> {
    await this.overlay.click({ position: { x: 8, y: 8 } });
  }

  async closeModalByEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async storageItem(key: string): Promise<string | null> {
    return this.page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
  }
}
