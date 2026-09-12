import { createAsyncThunk } from '@reduxjs/toolkit';

import { createOrderApi, getErrorMessage } from '@utils/burger-api';

export const createOrder = createAsyncThunk<number, string[], { rejectValue: string }>(
  'order/create',
  async (ingredientIds, { rejectWithValue }) => {
    try {
      return await createOrderApi(ingredientIds);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Не удалось оформить заказ'));
    }
  }
);
