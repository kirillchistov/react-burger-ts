import { Preloader } from '@krgaa/react-developer-burger-ui-components';

import { OrderCard } from '@components/order-card/order-card';
import { useAppSelector } from '@services/hooks';
import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsIsLoading,
} from '@services/ingredients/ingredients-slice';
import { getProfileOrderPath } from '@utils/constants';
import { PROFILE_ORDERS } from '@utils/mock-orders';

import styles from './profile-orders-page.module.css';

export const ProfileOrdersPage = (): React.JSX.Element => {
  const ingredients = useAppSelector(selectIngredients);
  const isLoading = useAppSelector(selectIngredientsIsLoading);
  const error = useAppSelector(selectIngredientsError);

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

  return (
    <ul className={`${styles.list} custom-scroll`}>
      {PROFILE_ORDERS.map((order) => (
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
