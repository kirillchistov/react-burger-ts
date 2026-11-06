import type { TOrder, TOrderStatus } from '@utils/types';

const bunR = '692889f16bf770001bfeb4cd';
const bunN = '692889f16bf770001bfeb4cc';
const rings = '692889f16bf770001bfeb4d6';
const fruits = '692889f16bf770001bfeb4d7';
const crystals = '692889f16bf770001bfeb4d8';
const salad = '692889f16bf770001bfeb4d9';
const cheese = '692889f16bf770001bfeb4da';
const filet = '692889f16bf770001bfeb4ce';
const mollusks = '692889f16bf770001bfeb4cf';
const meteor = '692889f16bf770001bfeb4d0';
const cutlet = '692889f16bf770001bfeb4d1';
const spicy = '692889f16bf770001bfeb4d2';
const space = '692889f16bf770001bfeb4d3';
const galactic = '692889f16bf770001bfeb4d4';
const spikes = '692889f16bf770001bfeb4d5';

const deathStar = [
  bunN,
  rings,
  crystals,
  salad,
  cheese,
  filet,
  mollusks,
  meteor,
  cutlet,
  bunN,
];
const interstellar = [bunN, meteor, spicy, space, bunN];
const blackHole = [bunR, filet, galactic, fruits, bunR];
const fluorescent = [bunR, bunR];
const supernova = [bunN, cutlet, spikes, cheese, bunN];

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

const extraDoneOrders = Array.from({ length: 8 }, (_, index): TOrder => {
  const number = 34527 - index;

  return createOrder(
    number,
    'done',
    `Space бургер ${index + 1}`,
    supernova,
    72 + index * 24
  );
});

export const FEED_TOTAL = 28752;
export const FEED_TOTAL_TODAY = 138;

export const FEED_ORDERS: TOrder[] = [
  createOrder(34535, 'done', 'Death Star Starship Main бургер', deathStar, 1),
  createOrder(34534, 'done', 'Interstellar бургер', interstellar, 3),
  createOrder(34533, 'done', 'Black Hole Singularity острый бургер', blackHole, 26),
  createOrder(34532, 'pending', 'Supernova Infinity бургер', supernova, 50),
  createOrder(34531, 'done', 'Краторный метеоритный бургер', interstellar, 30),
  createOrder(34530, 'pending', 'Люминесцентный бургер', fluorescent, 32),
  createOrder(34528, 'created', 'Антарианский бургер', [bunR, spikes, filet, bunR], 96),
  ...extraDoneOrders,
].sort((left, right): number => right.number - left.number);

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

const MOCK_ORDERS = [...FEED_ORDERS, ...PROFILE_ORDERS];

export const findMockOrder = (id: string | undefined): TOrder | null => {
  if (!id) {
    return null;
  }

  return MOCK_ORDERS.find((order) => order._id === id) ?? null;
};
