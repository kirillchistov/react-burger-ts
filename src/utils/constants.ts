// S3.3 Константы для Burger API, модальных окон, маршрутов
// S3.5 Константы для токенов Авторизации
export const BURGER_API_URL = 'https://new-stellarburgers.education-services.ru/api';

export const MODALS_ROOT_ID = 'modals';

export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const RESET_PASSWORD_FLAG_KEY = 'resetPasswordAllowed';

export const ROUTES = {
  FEED: '/feed',
  FORGOT_PASSWORD: '/forgot-password',
  HOME: '/',
  INGREDIENT: '/ingredients/:id',
  LOGIN: '/login',
  PROFILE: '/profile',
  PROFILE_ORDERS: '/profile/orders',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
} as const;

export const getIngredientPath = (id: string): string => `/ingredients/${id}`;
