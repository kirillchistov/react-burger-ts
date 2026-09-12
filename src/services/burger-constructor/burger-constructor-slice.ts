import { createSelector, createSlice, nanoid } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { TConstructorIngredient, TIngredient } from '@utils/types';

type TBurgerConstructorState = {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
};

const initialState: TBurgerConstructorState = {
  bun: null,
  ingredients: [],
};

export const burgerConstructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
          return;
        }

        state.ingredients.push(action.payload);
      },
      prepare: (ingredient: TIngredient) => ({
        payload: {
          ...ingredient,
          uuid: nanoid(),
        },
      }),
    },
    moveIngredient: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedIngredient] = state.ingredients.splice(fromIndex, 1);

      if (movedIngredient) {
        state.ingredients.splice(toIndex, 0, movedIngredient);
      }
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        (ingredient) => ingredient.uuid !== action.payload
      );
    },
  },
  selectors: {
    selectConstructorBun: (state): TIngredient | null => state.bun,
    selectConstructorIngredients: (state): TConstructorIngredient[] => state.ingredients,
    selectConstructorTotalPrice: createSelector(
      [
        (state: TBurgerConstructorState): TIngredient | null => state.bun,
        (state: TBurgerConstructorState): TConstructorIngredient[] => state.ingredients,
      ],
      (bun, ingredients): number =>
        (bun?.price ?? 0) * 2 +
        ingredients.reduce((sum, ingredient) => sum + ingredient.price, 0)
    ),
    selectIngredientCounts: createSelector(
      [
        (state: TBurgerConstructorState): TIngredient | null => state.bun,
        (state: TBurgerConstructorState): TConstructorIngredient[] => state.ingredients,
      ],
      (bun, ingredients): Record<string, number> => {
        const counts: Record<string, number> = {};

        if (bun) {
          counts[bun._id] = 2;
        }

        ingredients.forEach((ingredient) => {
          counts[ingredient._id] = (counts[ingredient._id] ?? 0) + 1;
        });

        return counts;
      }
    ),
  },
});

export const { addIngredient, moveIngredient, removeIngredient } =
  burgerConstructorSlice.actions;

export const {
  selectConstructorBun,
  selectConstructorIngredients,
  selectConstructorTotalPrice,
  selectIngredientCounts,
} = burgerConstructorSlice.selectors;
