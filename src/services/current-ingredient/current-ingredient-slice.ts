import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils/types';

type TCurrentIngredientState = {
  item: TIngredient | null;
};

const initialState: TCurrentIngredientState = {
  item: null,
};

export const currentIngredientSlice = createSlice({
  name: 'currentIngredient',
  initialState,
  reducers: {
    clearCurrentIngredient: (state) => {
      state.item = null;
    },
    setCurrentIngredient: (state, action: PayloadAction<TIngredient>) => {
      state.item = action.payload;
    },
  },
  selectors: {
    selectCurrentIngredient: (state) => state.item,
  },
});

export const { clearCurrentIngredient, setCurrentIngredient } =
  currentIngredientSlice.actions;

export const { selectCurrentIngredient } = currentIngredientSlice.selectors;
