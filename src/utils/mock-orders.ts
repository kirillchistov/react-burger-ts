import type { TOrder, TOrderStatus } from '@utils/types';

const bunR = '692889f16bf770001bfeb4cd';
const bunN = '692889f16bf770001bfeb4cc';
const fruits = '692889f16bf770001bfeb4d7';
const salad = '692889f16bf770001bfeb4d9';
const filet = '692889f16bf770001bfeb4ce';
const galactic = '692889f16bf770001bfeb4d4';

const fluorescent = [bunR, bunR];
const blackHole = [bunR, filet, galactic, fruits, bunR];

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const createOrder = (
  number: number,
  status: TOrderStatus,
  name: string,
  ingredients: string[],
  ageHours: number
): TOrder => {
  const createdAt = hoursAgo(ageHours);

  return {
    _id: `mock-${number}`,
    ingredients,
    status,
    name,
    number,
    createdAt,
    updatedAt: createdAt,
  };
};

export const PROFILE_ORDERS: TOrder[] = [
  createOrder(103219, 'done', 'Флюоресцентный бургер', fluorescent, 26),
  createOrder(103218, 'done', 'Флюоресцентный бургер', fluorescent, 28),
  createOrder(
    102269,
    'done',
    'Space флюоресцентный бургер',
    [bunR, filet, bunR],
    22 * 24
  ),
  createOrder(102200, 'pending', 'Галактический бургер', blackHole, 72),
  createOrder(
    102150,
    'created',
    'Экзо-плантаго бургер',
    [bunN, salad, galactic, bunN],
    120
  ),
];

export const findMockOrder = (id: string | undefined): TOrder | null => {
  if (!id) {
    return null;
  }

  return PROFILE_ORDERS.find((order) => order._id === id) ?? null;
};
