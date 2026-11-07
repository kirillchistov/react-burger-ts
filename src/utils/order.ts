import type { TIngredient, TOrder, TOrderStatus, TOrdersFeed } from '@utils/types';

export const ORDER_STATUS_TEXT: Record<TOrderStatus, string> = {
  created: 'Создан',
  pending: 'Готовится',
  done: 'Выполнен',
};

const STATUS_COLUMN_SIZE = 10;
const STATUS_COLUMN_LIMIT = 2;

export const PREVIEW_INGREDIENT_LIMIT = 6;

export const formatOrderNumber = (number: number): string =>
  `#${String(number).padStart(6, '0')}`;

export const isOrderStatus = (value: unknown): value is TOrderStatus =>
  value === 'created' || value === 'pending' || value === 'done';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const INVALID_TOKEN_MESSAGE = 'Invalid or missing token';

export const isInvalidTokenMessage = (value: unknown): boolean =>
  isRecord(value) && value.message === INVALID_TOKEN_MESSAGE;

export const isOrder = (value: unknown): value is TOrder => {
  if (!isRecord(value)) {
    return false;
  }

  const { _id, ingredients, status, name, number, createdAt, updatedAt } = value;

  return (
    typeof _id === 'string' &&
    _id.length > 0 &&
    Array.isArray(ingredients) &&
    ingredients.length > 0 &&
    ingredients.every((item: unknown): boolean => typeof item === 'string') &&
    isOrderStatus(status) &&
    typeof name === 'string' &&
    name.length > 0 &&
    typeof number === 'number' &&
    Number.isInteger(number) &&
    typeof createdAt === 'string' &&
    typeof updatedAt === 'string'
  );
};

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const parseOrdersFeed = (value: unknown): TOrdersFeed | null => {
  if (!isRecord(value) || value.success !== true || !Array.isArray(value.orders)) {
    return null;
  }

  if (!isCount(value.total) || !isCount(value.totalToday)) {
    return null;
  }

  return {
    orders: value.orders.filter(isOrder),
    total: value.total,
    totalToday: value.totalToday,
  };
};

export type TOrderIngredient = {
  ingredient: TIngredient;
  count: number;
};

export const getOrderIngredients = (
  order: TOrder,
  ingredients: TIngredient[]
): TOrderIngredient[] => {
  const counts = new Map<string, number>();

  order.ingredients.forEach((id) => {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  });

  const items: TOrderIngredient[] = [];

  counts.forEach((count, id) => {
    const ingredient = ingredients.find((item) => item._id === id);

    if (ingredient) {
      items.push({ count, ingredient });
    }
  });

  return items;
};

export const getOrderPrice = (items: TOrderIngredient[]): number =>
  items.reduce((sum, item) => sum + item.ingredient.price * item.count, 0);

export const splitOrderNumbers = (numbers: number[]): number[][] => {
  const visible = numbers.slice(0, STATUS_COLUMN_SIZE * STATUS_COLUMN_LIMIT);
  const columns: number[][] = [];

  for (let index = 0; index < visible.length; index += STATUS_COLUMN_SIZE) {
    columns.push(visible.slice(index, index + STATUS_COLUMN_SIZE));
  }

  return columns;
};
