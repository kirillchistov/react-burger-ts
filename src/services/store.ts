import { combineSlices, configureStore } from '@reduxjs/toolkit';

import { burgerConstructorSlice } from './burger-constructor/burger-constructor-slice';
import { currentIngredientSlice } from './current-ingredient/current-ingredient-slice';
import { ingredientsSlice } from './ingredients/ingredients-slice';
import { orderSlice } from './order/order-slice';

export const rootReducer = combineSlices(
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
