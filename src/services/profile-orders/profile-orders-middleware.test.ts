import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getWsAccessToken } from '@utils/auth';
import { refreshTokenApi } from '@utils/burger-api';

import { profileOrdersMiddleware } from './profile-orders-middleware';
import { profileOrdersConnect, profileOrdersSlice } from './profile-orders-slice';

vi.mock('@utils/auth', () => ({
  getWsAccessToken: vi.fn(),
}));

vi.mock('@utils/burger-api', () => ({
  refreshTokenApi: vi.fn(),
}));

class MockSocket {
  static instances: MockSocket[] = [];

  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  url: string;

  constructor(url: string) {
    this.url = url;
    MockSocket.instances.push(this);
  }

  close(): void {
    return undefined;
  }

  receive(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent<string>);
  }
}

describe('profileOrdersMiddleware', () => {
  beforeEach(() => {
    MockSocket.instances = [];
    vi.stubGlobal('WebSocket', MockSocket);
    vi.mocked(getWsAccessToken).mockReset();
    vi.mocked(refreshTokenApi).mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('после устаревшего токена подключается заново без префикса Bearer', async () => {
    vi.mocked(getWsAccessToken)
      .mockReturnValueOnce('stale-token')
      .mockReturnValue('fresh-token');
    vi.mocked(refreshTokenApi).mockResolvedValue({
      accessToken: 'Bearer fresh-token',
      refreshToken: 'refresh',
    });

    const store = configureStore({
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(profileOrdersMiddleware),
      reducer: profileOrdersSlice.reducer,
    });

    store.dispatch(profileOrdersConnect());
    MockSocket.instances[0]?.receive({ message: 'Invalid or missing token' });

    await vi.waitFor(() => {
      expect(MockSocket.instances).toHaveLength(2);
    });

    expect(refreshTokenApi).toHaveBeenCalledOnce();
    expect(MockSocket.instances[0]?.url).toContain('token=stale-token');
    expect(MockSocket.instances[1]?.url).toContain('token=fresh-token');
    expect(MockSocket.instances[1]?.url).not.toContain('Bearer');
  });
});
