import type { TIngredient } from '@utils/types';

export type TConstructorBurger = {
  bun: TIngredient | null;
  fillings: TIngredient[];
};

const DEMO_FILLINGS_LIMIT = 5;

export const getDemoBurger = (ingredients: TIngredient[]): TConstructorBurger => {
  const bun = ingredients.find((item) => item.type === 'bun') ?? null;
  const fillings = ingredients
    .filter((item) => item.type !== 'bun')
    .slice(0, DEMO_FILLINGS_LIMIT);

  return { bun, fillings };
};

export const getIngredientCounts = (
  burger: TConstructorBurger
): Record<string, number> => {
  const counts: Record<string, number> = {};

  if (burger.bun) {
    counts[burger.bun._id] = 2;
  }

  burger.fillings.forEach((item) => {
    counts[item._id] = (counts[item._id] ?? 0) + 1;
  });

  return counts;
};
