import { Preloader } from '@krgaa/react-developer-burger-ui-components';
import { useNavigate, useParams } from 'react-router-dom';

import { Modal } from '@components/modal/modal';
import { OrderInfo } from '@components/order-info/order-info';
import { ProtectedRoute } from '@components/protected-route/protected-route';
import { useOrder } from '@hooks/useOrder';
import { formatOrderNumber } from '@utils/order';

import type { TOrder } from '@utils/types';

import styles from './order-page.module.css';

type TOrderDetailsProps = {
  error: string | null;
  isLoading: boolean;
  order: TOrder | null;
  variant: 'modal' | 'page';
};

const OrderDetails = ({
  error,
  isLoading,
  order,
  variant,
}: TOrderDetailsProps): React.JSX.Element => {
  if (isLoading) {
    return (
      <div className={styles.status}>
        <Preloader />
      </div>
    );
  }

  if (!order) {
    return (
      <p className={`${styles.status} text text_type_main-medium`}>
        {error ?? 'Заказ не найден'}
      </p>
    );
  }

  return <OrderInfo order={order} variant={variant} />;
};

export const OrderPage = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const { error, isLoading, order } = useOrder(id);

  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <OrderDetails error={error} isLoading={isLoading} order={order} variant="page" />
      </div>
    </section>
  );
};

export const OrderModal = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error, isLoading, order } = useOrder(id);

  const handleClose = (): void => {
    void navigate(-1);
  };

  return (
    <Modal
      onClose={handleClose}
      title={order ? formatOrderNumber(order.number) : undefined}
      titleClassName="text text_type_digits-default"
    >
      <OrderDetails error={error} isLoading={isLoading} order={order} variant="modal" />
    </Modal>
  );
};

export const ProfileOrderModal = (): React.JSX.Element => (
  <ProtectedRoute>
    <OrderModal />
  </ProtectedRoute>
);
