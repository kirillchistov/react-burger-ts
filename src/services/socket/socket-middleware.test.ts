import { configureStore, createSlice } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSocketMiddleware, SOCKET_RECONNECT_DELAY } from './socket-middleware';

import type { EnhancedStore, PayloadAction } from '@reduxjs/toolkit';

type TState = {
  messages: unknown[];
  status: string;
};

class MockSocket {
  static instances: MockSocket[] = [];

  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  url: string;

  constructor(url: string) {
    this.url = url;
    MockSocket.instances.push(this);
  }

  close(): void {
    this.onclose?.();
  }

  receive(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent<string>);
  }
}

const testSlice = createSlice({
  name: 'socketTest',
  initialState: { messages: [] as unknown[], status: 'idle' } satisfies TState,
  reducers: {
    closed: (state) => {
      state.status = 'closed';
    },
    connect: (state) => {
      state.status = 'connecting';
    },
    disconnect: (state) => {
      state.status = 'closed';
    },
    failed: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
    },
    received: (state, action: PayloadAction<unknown>) => {
      state.messages.push(action.payload);
      state.status = 'live';
    },
  },
});

const { closed, connect, disconnect, failed, received } = testSlice.actions;

const createTestStore = (
  getUrl: () => string | null = (): string => 'wss://orders/all'
): EnhancedStore<TState> => {
  const middleware = createSocketMiddleware({
    closed,
    connect,
    disconnect,
    failed,
    failureMessage: 'Не удалось подключиться',
    getUrl,
    onMessage: (data, dispatch): void => {
      dispatch(received(data));
    },
  });

  return configureStore({
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middleware),
    reducer: testSlice.reducer,
  });
};

describe('createSocketMiddleware', () => {
  beforeEach(() => {
    MockSocket.instances = [];
    vi.stubGlobal('WebSocket', MockSocket);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('открывает сокет по экшену подключения и передаёт разобранное сообщение', () => {
    const store = createTestStore();

    store.dispatch(connect());
    MockSocket.instances[0]?.receive({ success: true });

    expect(MockSocket.instances[0]?.url).toBe('wss://orders/all');
    expect(store.getState().messages).toEqual([{ success: true }]);
    expect(store.getState().status).toBe('live');
  });

  it('пропускает сообщение, которое не является JSON', () => {
    const store = createTestStore();

    store.dispatch(connect());
    MockSocket.instances[0]?.onmessage?.({ data: 'не json' } as MessageEvent<string>);

    expect(store.getState().messages).toEqual([]);
  });

  it('после обрыва открывает сокет снова', () => {
    const store = createTestStore();

    store.dispatch(connect());
    MockSocket.instances[0]?.onclose?.();

    expect(store.getState().status).toBe('closed');
    expect(MockSocket.instances).toHaveLength(1);

    vi.advanceTimersByTime(SOCKET_RECONNECT_DELAY);

    expect(MockSocket.instances).toHaveLength(2);
    expect(store.getState().status).toBe('connecting');
  });

  it('не переподключается, если страницу уже покинули', () => {
    const store = createTestStore();

    store.dispatch(connect());
    store.dispatch(disconnect());
    vi.advanceTimersByTime(SOCKET_RECONNECT_DELAY);

    expect(MockSocket.instances).toHaveLength(1);
    expect(store.getState().status).toBe('closed');
  });

  it('сообщает об ошибке, если адрес сокета собрать нельзя', () => {
    const store = createTestStore((): null => null);

    store.dispatch(connect());

    expect(MockSocket.instances).toHaveLength(0);
    expect(store.getState().status).toBe('Не удалось подключиться');
  });
});
