// S3.3 Типы для Burger API
// S3.5 Типы для токенов Авторизации
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
