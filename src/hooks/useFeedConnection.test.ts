import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { feedConnecting, feedDisconnect } from '@services/feed/feed-slice';

import { useFeedConnection } from './useFeedConnection';

const { dispatch } = vi.hoisted(() => ({
  dispatch: vi.fn(),
}));

vi.mock('@services/hooks', () => ({
  useAppDispatch: (): typeof dispatch => dispatch,
}));

describe('useFeedConnection', (): void => {
  beforeEach((): void => {
    dispatch.mockClear();
  });

  it('подключает ленту на маунте и отключает на анмаунте', (): void => {
    const { unmount } = renderHook((): void => {
      useFeedConnection();
    });

    expect(dispatch).toHaveBeenCalledWith(feedConnecting());

    unmount();

    expect(dispatch).toHaveBeenCalledWith(feedDisconnect());
  });
});
