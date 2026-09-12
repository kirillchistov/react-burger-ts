import { createAsyncThunk } from '@reduxjs/toolkit';

import { getErrorMessage, getIngredientsApi } from '@utils/burger-api';

import type { TIngredient } from '@utils/types';

export const fetchIngredients = createAsyncThunk<
  TIngredient[],
  void,
  { rejectValue: string }
>('ingredients/fetchAll', async (_payload, { rejectWithValue, signal }) => {
  try {
    return await getIngredientsApi(signal);
  } catch (error) {
    if (signal.aborted) {
      throw error;
    }

    return rejectWithValue(getErrorMessage(error));
  }
});
