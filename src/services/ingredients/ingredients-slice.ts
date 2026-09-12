import { createSlice } from '@reduxjs/toolkit';

import { fetchIngredients } from './ingredients-actions';

import type { TIngredient } from '@utils/types';

type TIngredientsState = {
  error: string | null;
  isLoading: boolean;
  items: TIngredient[];
};

const initialState: TIngredientsState = {
  error: null,
  isLoading: false,
  items: [],
};

export const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        if (action.meta.aborted) {
          return;
        }

        state.isLoading = false;
        state.error = action.payload ?? 'Не удалось загрузить ингредиенты';
      });
  },
  selectors: {
    selectIngredients: (state) => state.items,
    selectIngredientsError: (state) => state.error,
    selectIngredientsIsLoading: (state) => state.isLoading,
  },
});

export const { selectIngredients, selectIngredientsError, selectIngredientsIsLoading } =
  ingredientsSlice.selectors;
