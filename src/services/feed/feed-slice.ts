import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { TOrder, TOrdersFeed } from '@utils/types';

type TFeedConnectionStatus = 'closed' | 'connecting' | 'idle' | 'live';

type TFeedState = {
  error: string | null;
  orders: TOrder[];
  status: TFeedConnectionStatus;
  total: number;
  totalToday: number;
};

const initialState: TFeedState = {
  error: null,
  orders: [],
  status: 'idle',
  total: 0,
  totalToday: 0,
};

const closeConnection = (state: TFeedState): void => {
  state.status = 'closed';
};

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    feedClosed: closeConnection,
    feedConnecting: (state) => {
      state.error = null;
      state.status = 'connecting';
    },
    feedDisconnect: closeConnection,
    feedFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.status = 'closed';
    },
    feedUpdated: (state, action: PayloadAction<TOrdersFeed>) => {
      state.error = null;
      state.orders = action.payload.orders;
      state.status = 'live';
      state.total = action.payload.total;
      state.totalToday = action.payload.totalToday;
    },
  },
  selectors: {
    selectFeedError: (state): string | null => state.error,
    selectFeedOrders: (state): TOrder[] => state.orders,
    selectFeedStatus: (state): TFeedConnectionStatus => state.status,
    selectFeedTotal: (state): number => state.total,
    selectFeedTotalToday: (state): number => state.totalToday,
  },
});

export const { feedClosed, feedConnecting, feedDisconnect, feedFailed, feedUpdated } =
  feedSlice.actions;

export const {
  selectFeedError,
  selectFeedOrders,
  selectFeedStatus,
  selectFeedTotal,
  selectFeedTotalToday,
} = feedSlice.selectors;
