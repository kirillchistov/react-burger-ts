import { useEffect, useState } from 'react';

import { getErrorMessage, getOrderByIdApi } from '@utils/burger-api';
import { findMockOrder } from '@utils/mock-orders';

import type { TOrder } from '@utils/types';

type TUseOrderResult = {
  error: string | null;
  isLoading: boolean;
  order: TOrder | null;
};

export const useOrder = (id: string | undefined): TUseOrderResult => {
  const [order, setOrder] = useState<TOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cachedOrder = findMockOrder(id);

    if (!id) {
      setOrder(null);
      setError('Заказ не найден');
      setIsLoading(false);
      return;
    }

    if (cachedOrder) {
      setOrder(cachedOrder);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    setOrder(null);

    void getOrderByIdApi(id, controller.signal)
      .then((nextOrder): void => {
        setOrder(nextOrder);
      })
      .catch((requestError: unknown): void => {
        if (controller.signal.aborted) {
          return;
        }

        setOrder(null);
        setError(getErrorMessage(requestError, 'Не удалось загрузить заказ'));
      })
      .finally((): void => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return (): void => {
      controller.abort();
    };
  }, [id]);

  return { error, isLoading, order };
};
