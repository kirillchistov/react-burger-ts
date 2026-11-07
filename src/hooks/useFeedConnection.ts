import { useEffect } from 'react';

import { feedConnecting, feedDisconnect } from '@services/feed/feed-slice';
import { useAppDispatch } from '@services/hooks';

export const useFeedConnection = (): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(feedConnecting());

    return (): void => {
      dispatch(feedDisconnect());
    };
  }, [dispatch]);
};
