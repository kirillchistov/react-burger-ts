import { Preloader } from '@krgaa/react-developer-burger-ui-components';

import { OrderCard } from '@components/order-card/order-card';
import { useProfileOrdersConnection } from '@hooks/useProfileOrdersConnection';
import { useAppSelector } from '@services/hooks';
import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsIsLoading,
} from '@services/ingredients/ingredients-slice';
import {
  selectProfileOrders,
  selectProfileOrdersError,
  selectProfileOrdersStatus,
} from '@services/profile-orders/profile-orders-slice';
import { getProfileOrderPath } from '@utils/constants';

import styles from './profile-orders-page.module.css';

export const ProfileOrdersPage = (): React.JSX.Element => {
  useProfileOrdersConnection();
  const ingredients = useAppSelector(selectIngredients);
  const isLoading = useAppSelector(selectIngredientsIsLoading);
  const error = useAppSelector(selectIngredientsError);
  const orders = useAppSelector(selectProfileOrders);
  const ordersError = useAppSelector(selectProfileOrdersError);
  const ordersStatus = useAppSelector(selectProfileOrdersStatus);

  if (isLoading && ingredients.length === 0) {
    return (
      <div className={styles.status}>
        <Preloader />
      </div>
    );
  }

  if (error && ingredients.length === 0) {
    return <p className={`${styles.status} text text_type_main-medium`}>{error}</p>;
  }

  if (orders.length === 0 && ordersError) {
    return (
      <p className={`${styles.status} text text_type_main-medium`}>{ordersError}</p>
    );
  }

  if (ordersStatus !== 'live' && orders.length === 0) {
    return (
      <div className={styles.status}>
        <Preloader />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <p className={`${styles.status} text text_type_main-default text_color_inactive`}>
        Вы ещё не создали ни одного заказа
      </p>
    );
  }

  return (
    <ul className={`${styles.list} custom-scroll`}>
      {orders.map((order) => (
        <OrderCard
          key={order._id}
          order={order}
          showStatus
          to={getProfileOrderPath(order._id)}
        />
      ))}
    </ul>
  );
};
