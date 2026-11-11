import { describe, expect, it } from 'vitest';

import {
  clearCurrentIngredient,
  currentIngredientSlice,
  setCurrentIngredient,
} from './current-ingredient-slice';

import type { TIngredient } from '@utils/types';

const { getInitialState, reducer } = currentIngredientSlice;

const ingredient: TIngredient = {
  _id: 'sauce-1',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'sauce.png',
  image_large: 'sauce-large.png',
  image_mobile: 'sauce-mobile.png',
  __v: 0,
};

describe('currentIngredientSlice', (): void => {
  it('начинает без выбранного ингредиента', (): void => {
    expect(getInitialState()).toEqual({ item: null });
  });

  it('кладёт ингредиент в стор', (): void => {
    expect(reducer(getInitialState(), setCurrentIngredient(ingredient))).toEqual({
      item: ingredient,
    });
  });

  it('сбрасывает выбранный ингредиент', (): void => {
    const selected = reducer(getInitialState(), setCurrentIngredient(ingredient));

    expect(reducer(selected, clearCurrentIngredient())).toEqual(getInitialState());
  });
});
