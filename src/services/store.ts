// S3.5 Конфигурация Redux-store для авторизации
import { combineSlices, configureStore } from '@reduxjs/toolkit';

import { authSlice } from './auth/auth-slice';
import { burgerConstructorSlice } from './burger-constructor/burger-constructor-slice';
import { currentIngredientSlice } from './current-ingredient/current-ingredient-slice';
import { feedMiddleware } from './feed/feed-middleware';
import { feedSlice } from './feed/feed-slice';
import { ingredientsSlice } from './ingredients/ingredients-slice';
import { orderSlice } from './order/order-slice';
import { profileOrdersMiddleware } from './profile-orders/profile-orders-middleware';
import { profileOrdersSlice } from './profile-orders/profile-orders-slice';

export const rootReducer = combineSlices(
  authSlice,
  burgerConstructorSlice,
  currentIngredientSlice,
  feedSlice,
  ingredientsSlice,
  orderSlice,
  profileOrdersSlice
);

export const store = configureStore({
  devTools: import.meta.env.DEV,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(feedMiddleware, profileOrdersMiddleware),
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
