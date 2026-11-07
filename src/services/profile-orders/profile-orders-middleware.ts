import { createSocketMiddleware } from '@services/socket/socket-middleware';
import { getWsAccessToken } from '@utils/auth';
import { refreshTokenApi } from '@utils/burger-api';
import { getProfileOrdersWsUrl } from '@utils/constants';
import { isInvalidTokenMessage, parseOrdersFeed } from '@utils/order';

import {
  profileOrdersClosed,
  profileOrdersConnect,
  profileOrdersDisconnect,
  profileOrdersFailed,
  profileOrdersUpdated,
} from './profile-orders-slice';

import type { Middleware } from '@reduxjs/toolkit';

const PROFILE_CONNECTION_ERROR = 'Не удалось подключиться к истории заказов';
const PROFILE_TOKEN_ERROR = 'Не удалось обновить токен. Войдите снова';

export const profileOrdersMiddleware: Middleware = (storeApi) => {
  let refreshGeneration = 0;

  const socketMiddleware = createSocketMiddleware({
    closed: profileOrdersClosed,
    connect: profileOrdersConnect,
    disconnect: profileOrdersDisconnect,
    failed: profileOrdersFailed,
    failureMessage: PROFILE_CONNECTION_ERROR,
    getUrl: (): string | null => {
      const token = getWsAccessToken();

      return token ? getProfileOrdersWsUrl(token) : null;
    },
    onMessage: (data, dispatch): void => {
      if (isInvalidTokenMessage(data)) {
        dispatch(profileOrdersDisconnect());
        const generation = refreshGeneration;

        void refreshTokenApi()
          .then((): void => {
            if (generation !== refreshGeneration) {
              return;
            }

            dispatch(profileOrdersConnect());
          })
          .catch((): void => {
            if (generation !== refreshGeneration) {
              return;
            }

            dispatch(profileOrdersFailed(PROFILE_TOKEN_ERROR));
          });

        return;
      }

      const feed = parseOrdersFeed(data);

      if (feed) {
        dispatch(profileOrdersUpdated(feed));
      }
    },
  })(storeApi);

  return (next) =>
    (action: unknown): unknown => {
      if (profileOrdersDisconnect.match(action)) {
        refreshGeneration += 1;
      }

      return socketMiddleware(next)(action);
    };
};
