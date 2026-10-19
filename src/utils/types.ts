/* S4.1 Тела auth запросов убрал в src/utils/types.ts, 
уменьшил, дублирование, подключил в API и thunks */
export type TIngredientType = 'bun' | 'main' | 'sauce';

export type TIngredient = {
  _id: string;
  name: string;
  type: TIngredientType;
  proteins: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  price: number;
  image: string;
  image_large: string;
  image_mobile: string;
  __v: number;
};

export type TConstructorIngredient = TIngredient & {
  uuid: string;
};

export type TUser = {
  email: string;
  name: string;
};

export type TAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type TLoginData = {
  email: string;
  password: string;
};

export type TRegisterData = TLoginData & {
  name: string;
};

export type TUpdateUserData = TUser & {
  password?: string;
};

export type TResetPasswordData = {
  password: string;
  token: string;
};
