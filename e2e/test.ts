import { test as base } from '@playwright/test';

import {
  FeedPage,
  ForgotPasswordPage,
  HomePage,
  IngredientPage,
  LoginPage,
  NotFoundPage,
  OrderPage,
  ProfileOrdersPage,
  ProfilePage,
  RegisterPage,
  ResetPasswordPage,
} from './pages';

type TPages = {
  feedPage: FeedPage;
  forgotPasswordPage: ForgotPasswordPage;
  homePage: HomePage;
  ingredientPage: IngredientPage;
  loginPage: LoginPage;
  notFoundPage: NotFoundPage;
  orderPage: OrderPage;
  profileOrdersPage: ProfileOrdersPage;
  profilePage: ProfilePage;
  registerPage: RegisterPage;
  resetPasswordPage: ResetPasswordPage;
};

export const test = base.extend<TPages>({
  feedPage: async ({ page }, provide): Promise<void> => {
    await provide(new FeedPage(page));
  },
  forgotPasswordPage: async ({ page }, provide): Promise<void> => {
    await provide(new ForgotPasswordPage(page));
  },
  homePage: async ({ page }, provide): Promise<void> => {
    await provide(new HomePage(page));
  },
  ingredientPage: async ({ page }, provide): Promise<void> => {
    await provide(new IngredientPage(page));
  },
  loginPage: async ({ page }, provide): Promise<void> => {
    await provide(new LoginPage(page));
  },
  notFoundPage: async ({ page }, provide): Promise<void> => {
    await provide(new NotFoundPage(page));
  },
  orderPage: async ({ page }, provide): Promise<void> => {
    await provide(new OrderPage(page));
  },
  profileOrdersPage: async ({ page }, provide): Promise<void> => {
    await provide(new ProfileOrdersPage(page));
  },
  profilePage: async ({ page }, provide): Promise<void> => {
    await provide(new ProfilePage(page));
  },
  registerPage: async ({ page }, provide): Promise<void> => {
    await provide(new RegisterPage(page));
  },
  resetPasswordPage: async ({ page }, provide): Promise<void> => {
    await provide(new ResetPasswordPage(page));
  },
});

export { expect } from '@playwright/test';
