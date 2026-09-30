import { combineSlices, configureStore } from '@reduxjs/toolkit';

import { authSlice } from './auth/auth-slice';
import { burgerConstructorSlice } from './burger-constructor/burger-constructor-slice';
import { currentIngredientSlice } from './current-ingredient/current-ingredient-slice';
import { ingredientsSlice } from './ingredients/ingredients-slice';
import { orderSlice } from './order/order-slice';

export const rootReducer = combineSlices(
  authSlice,
  burgerConstructorSlice,
  currentIngredientSlice,
  ingredientsSlice,
  orderSlice
);

export const store = configureStore({
  devTools: import.meta.env.DEV,
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
