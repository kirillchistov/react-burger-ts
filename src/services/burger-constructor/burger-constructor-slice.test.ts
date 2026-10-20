// S4.4 Тесты для бургер-конструктора
import { describe, expect, it } from 'vitest';

import { store } from '@services/store';

import {
  addIngredient,
  burgerConstructorSlice,
  clearConstructor,
  moveIngredient,
  removeIngredient,
  selectConstructorBun,
  selectConstructorIngredients,
  selectConstructorTotalPrice,
  selectIngredientCounts,
} from './burger-constructor-slice';

import type { RootState } from '@services/store';
import type { TIngredient, TIngredientType } from '@utils/types';

const { getInitialState, reducer } = burgerConstructorSlice;

const createIngredient = (
  id: string,
  type: TIngredientType,
  price: number
): TIngredient => ({
  _id: id,
  name: id,
  type,
  proteins: 1,
  fat: 1,
  carbohydrates: 1,
  calories: 1,
  price,
  image: 'image.png',
  image_large: 'image-large.png',
  image_mobile: 'image-mobile.png',
  __v: 0,
});

const asRootState = (
  constructorState: ReturnType<typeof getInitialState>
): RootState => ({
  ...store.getState(),
  burgerConstructor: constructorState,
});

describe('burgerConstructorSlice', (): void => {
  it('начинает с пустого конструктора', (): void => {
    expect(getInitialState()).toEqual({
      bun: null,
      ingredients: [],
    });
  });

  it('кладёт булку отдельно и заменяет предыдущую', (): void => {
    const firstBun = createIngredient('bun-1', 'bun', 100);
    const nextBun = createIngredient('bun-2', 'bun', 200);

    const withFirstBun = reducer(getInitialState(), addIngredient(firstBun));
    const withNextBun = reducer(withFirstBun, addIngredient(nextBun));

    expect(withFirstBun.ingredients).toEqual([]);
    expect(withFirstBun.bun).toMatchObject(firstBun);
    expect(withNextBun.bun).toMatchObject(nextBun);
    expect(withNextBun.bun).not.toBe(withFirstBun.bun);
  });

  it('добавляет начинку со своим uuid и удаляет её по uuid', (): void => {
    const sauce = createIngredient('sauce-1', 'sauce', 50);
    const main = createIngredient('main-1', 'main', 80);
    const withSauce = reducer(getInitialState(), addIngredient(sauce));
    const withBoth = reducer(withSauce, addIngredient(main));
    const sauceUuid = withBoth.ingredients[0]?.uuid ?? '';

    const withoutSauce = reducer(withBoth, removeIngredient(sauceUuid));

    expect(withBoth.ingredients).toHaveLength(2);
    expect(withBoth.ingredients[0]).toMatchObject(sauce);
    expect(withBoth.ingredients[1]).toMatchObject(main);
    expect(withBoth.ingredients[0]?.uuid).not.toBe(withBoth.ingredients[1]?.uuid);
    expect(withoutSauce.ingredients).toEqual([withBoth.ingredients[1]]);
  });

  it('меняет порядок начинки', (): void => {
    const first = createIngredient('main-1', 'main', 10);
    const second = createIngredient('main-2', 'main', 20);
    const third = createIngredient('main-3', 'main', 30);
    const filled = [first, second, third].reduce(
      (state, ingredient) => reducer(state, addIngredient(ingredient)),
      getInitialState()
    );

    const moved = reducer(filled, moveIngredient({ fromIndex: 0, toIndex: 2 }));

    expect(moved.ingredients.map((ingredient) => ingredient._id)).toEqual([
      'main-2',
      'main-3',
      'main-1',
    ]);
  });

  it('очищает булку и начинку', (): void => {
    const filled = reducer(
      reducer(getInitialState(), addIngredient(createIngredient('bun-1', 'bun', 100))),
      addIngredient(createIngredient('main-1', 'main', 40))
    );

    expect(reducer(filled, clearConstructor())).toEqual(getInitialState());
  });

  it('считает стоимость и количество', (): void => {
    const state = [
      createIngredient('bun-1', 'bun', 200),
      createIngredient('sauce-1', 'sauce', 50),
      createIngredient('sauce-1', 'sauce', 50),
      createIngredient('main-1', 'main', 30),
    ].reduce(
      (current, ingredient) => reducer(current, addIngredient(ingredient)),
      getInitialState()
    );
    const rootState = asRootState(state);

    expect(selectConstructorBun(rootState)).toMatchObject({ _id: 'bun-1', price: 200 });
    expect(selectConstructorIngredients(rootState)).toHaveLength(3);
    expect(selectConstructorTotalPrice(rootState)).toBe(530);
    expect(selectIngredientCounts(rootState)).toEqual({
      'bun-1': 2,
      'main-1': 1,
      'sauce-1': 2,
    });
  });
});
