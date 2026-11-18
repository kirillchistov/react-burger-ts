import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  profileOrdersConnect,
  profileOrdersDisconnect,
  profileOrdersFailed,
} from '@services/profile-orders/profile-orders-slice';
import { getWsAccessToken } from '@utils/auth';

import { useProfileOrdersConnection } from './useProfileOrdersConnection';

const { dispatch } = vi.hoisted(() => ({
  dispatch: vi.fn(),
}));

vi.mock('@services/hooks', () => ({
  useAppDispatch: (): typeof dispatch => dispatch,
}));

vi.mock('@utils/auth', () => ({
  getWsAccessToken: vi.fn(),
}));

describe('useProfileOrdersConnection', (): void => {
  beforeEach((): void => {
    dispatch.mockClear();
    vi.mocked(getWsAccessToken).mockReset();
  });

  it('без токена сообщает об ошибке и не подключается', (): void => {
    vi.mocked(getWsAccessToken).mockReturnValue(null);

    const { unmount } = renderHook((): void => {
      useProfileOrdersConnection();
    });

    expect(dispatch).toHaveBeenCalledWith(profileOrdersFailed('Нет токена доступа'));
    expect(dispatch).not.toHaveBeenCalledWith(profileOrdersConnect());

    unmount();

    expect(dispatch).not.toHaveBeenCalledWith(profileOrdersDisconnect());
  });

  it('с токеном подключает историю и отключает на анмаунте', (): void => {
    vi.mocked(getWsAccessToken).mockReturnValue('access-token');

    const { unmount } = renderHook((): void => {
      useProfileOrdersConnection();
    });

    expect(dispatch).toHaveBeenCalledWith(profileOrdersConnect());

    unmount();

    expect(dispatch).toHaveBeenCalledWith(profileOrdersDisconnect());
  });
});
