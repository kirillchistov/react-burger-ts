import { Preloader } from '@krgaa/react-developer-burger-ui-components';

import { OrderCard } from '@components/order-card/order-card';
import { OrderStats } from '@components/order-stats/order-stats';
import { useAppSelector } from '@services/hooks';
import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsIsLoading,
} from '@services/ingredients/ingredients-slice';
import { getFeedOrderPath } from '@utils/constants';
import { FEED_ORDERS, FEED_TOTAL, FEED_TOTAL_TODAY } from '@utils/mock-orders';

import styles from './feed-page.module.css';

export const FeedPage = (): React.JSX.Element => {
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
    <section className={styles.feed}>
      <div className={styles.orders}>
        <h1 className={`${styles.title} text text_type_main-large`}>Лента заказов</h1>
        <ul className={`${styles.list} custom-scroll`}>
          {FEED_ORDERS.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              showStatus={false}
              to={getFeedOrderPath(order._id)}
            />
          ))}
        </ul>
      </div>
      <OrderStats
        orders={FEED_ORDERS}
        total={FEED_TOTAL}
        totalToday={FEED_TOTAL_TODAY}
      />
    </section>
  );
};
