import { createSocketMiddleware } from '@services/socket/socket-middleware';
import { FEED_WS_URL } from '@utils/constants';
import { parseOrdersFeed } from '@utils/order';

import {
  feedClosed,
  feedConnecting,
  feedDisconnect,
  feedFailed,
  feedUpdated,
} from './feed-slice';

const FEED_CONNECTION_ERROR = 'Не удалось подключиться к ленте заказов';

export const feedMiddleware = createSocketMiddleware({
  closed: feedClosed,
  connect: feedConnecting,
  disconnect: feedDisconnect,
  failed: feedFailed,
  failureMessage: FEED_CONNECTION_ERROR,
  getUrl: (): string => FEED_WS_URL,
  onMessage: (data, dispatch): void => {
    const feed = parseOrdersFeed(data);

    if (feed) {
      dispatch(feedUpdated(feed));
    }
  },
});
