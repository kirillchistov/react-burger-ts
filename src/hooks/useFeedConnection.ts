import { useEffect } from 'react';

import { feedConnecting, feedFailed, feedUpdated } from '@services/feed/feed-slice';
import { useAppDispatch } from '@services/hooks';
import { FEED_WS_URL } from '@utils/constants';
import { parseOrdersFeed } from '@utils/order';

const FEED_RECONNECT_DELAY = 3000;
const FEED_CONNECTION_ERROR = 'Не удалось подключиться к ленте заказов';

const readSocketData = (data: unknown): unknown => {
  if (typeof data !== 'string') {
    return null;
  }

  try {
    return JSON.parse(data) as unknown;
  } catch {
    return null;
  }
};

export const useFeedConnection = (): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer = 0;
    let isUnmounted = false;

    const connect = (): void => {
      dispatch(feedConnecting());
      socket = new WebSocket(FEED_WS_URL);

      socket.onmessage = (event: MessageEvent<string>): void => {
        const feed = parseOrdersFeed(readSocketData(event.data));

        if (feed) {
          dispatch(feedUpdated(feed));
        }
      };

      socket.onerror = (): void => {
        dispatch(feedFailed(FEED_CONNECTION_ERROR));
      };

      socket.onclose = (): void => {
        if (isUnmounted) {
          return;
        }

        reconnectTimer = window.setTimeout(connect, FEED_RECONNECT_DELAY);
      };
    };

    connect();

    return (): void => {
      isUnmounted = true;
      window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [dispatch]);
};
