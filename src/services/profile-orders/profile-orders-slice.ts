import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { TOrder, TOrdersFeed } from '@utils/types';

type TProfileOrdersStatus = 'closed' | 'connecting' | 'idle' | 'live';

type TProfileOrdersState = {
  error: string | null;
  orders: TOrder[];
  status: TProfileOrdersStatus;
};

const initialState: TProfileOrdersState = {
  error: null,
  orders: [],
  status: 'idle',
};

const closeConnection = (state: TProfileOrdersState): void => {
  state.status = 'closed';
};

export const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {
    profileOrdersClosed: closeConnection,
    profileOrdersConnect: (state) => {
      state.error = null;
      state.status = 'connecting';
    },
    profileOrdersDisconnect: closeConnection,
    profileOrdersFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.status = 'closed';
    },
    profileOrdersUpdated: (state, action: PayloadAction<TOrdersFeed>) => {
      state.error = null;
      state.orders = action.payload.orders;
      state.status = 'live';
    },
  },
  selectors: {
    selectProfileOrders: (state): TOrder[] => state.orders,
    selectProfileOrdersError: (state): string | null => state.error,
    selectProfileOrdersStatus: (state): TProfileOrdersStatus => state.status,
  },
});

export const {
  profileOrdersClosed,
  profileOrdersConnect,
  profileOrdersDisconnect,
  profileOrdersFailed,
  profileOrdersUpdated,
} = profileOrdersSlice.actions;

export const {
  selectProfileOrders,
  selectProfileOrdersError,
  selectProfileOrdersStatus,
} = profileOrdersSlice.selectors;
