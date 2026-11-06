// S3.3 Константы для Burger API, модальных окон, маршрутов
// S3.5 Константы для токенов Авторизации
export const BURGER_API_URL = 'https://new-stellarburgers.education-services.ru/api';

const BURGER_WS_URL = 'wss://new-stellarburgers.education-services.ru/orders';

export const FEED_WS_URL = `${BURGER_WS_URL}/all`;

export const MODALS_ROOT_ID = 'modals';

export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const RESET_PASSWORD_FLAG_KEY = 'resetPasswordAllowed';

export const ROUTES = {
  FEED: '/feed',
  FEED_ORDER: '/feed/:id',
  FORGOT_PASSWORD: '/forgot-password',
  HOME: '/',
  INGREDIENT: '/ingredients/:id',
  LOGIN: '/login',
  PROFILE: '/profile',
  PROFILE_ORDER: '/profile/orders/:id',
  PROFILE_ORDERS: '/profile/orders',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
} as const;

export const getIngredientPath = (id: string): string => `/ingredients/${id}`;

export const getFeedOrderPath = (id: string): string => `/feed/${id}`;

export const getProfileOrderPath = (id: string): string => `/profile/orders/${id}`;
