import { useEffect } from 'react';

import { useAppDispatch } from '@services/hooks';
import {
  profileOrdersConnect,
  profileOrdersDisconnect,
  profileOrdersFailed,
} from '@services/profile-orders/profile-orders-slice';
import { getWsAccessToken } from '@utils/auth';

const MISSING_TOKEN_ERROR = 'Нет токена доступа';

export const useProfileOrdersConnection = (): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!getWsAccessToken()) {
      dispatch(profileOrdersFailed(MISSING_TOKEN_ERROR));
      return;
    }

    dispatch(profileOrdersConnect());

    return (): void => {
      dispatch(profileOrdersDisconnect());
    };
  }, [dispatch]);
};
