import { Preloader } from '@krgaa/react-developer-burger-ui-components';

import { OrderCard } from '@components/order-card/order-card';
import { OrderStats } from '@components/order-stats/order-stats';
import { useFeedConnection } from '@hooks/useFeedConnection';
import {
  selectFeedError,
  selectFeedOrders,
  selectFeedStatus,
  selectFeedTotal,
  selectFeedTotalToday,
} from '@services/feed/feed-slice';
import { useAppSelector } from '@services/hooks';
import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsIsLoading,
} from '@services/ingredients/ingredients-slice';
import { getFeedOrderPath } from '@utils/constants';

import styles from './feed-page.module.css';

export const FeedPage = (): React.JSX.Element => {
  useFeedConnection();
  const ingredients = useAppSelector(selectIngredients);
  const isLoading = useAppSelector(selectIngredientsIsLoading);
  const error = useAppSelector(selectIngredientsError);
  const orders = useAppSelector(selectFeedOrders);
  const total = useAppSelector(selectFeedTotal);
  const totalToday = useAppSelector(selectFeedTotalToday);
  const feedError = useAppSelector(selectFeedError);
  const feedStatus = useAppSelector(selectFeedStatus);

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

  if (orders.length === 0 && feedError) {
    return <p className={`${styles.status} text text_type_main-medium`}>{feedError}</p>;
  }

  if (feedStatus !== 'live' && orders.length === 0) {
    return (
      <div className={styles.status}>
        <Preloader />
      </div>
    );
  }

  return (
    <section className={styles.feed}>
      <div className={styles.orders}>
        <h1 className={`${styles.title} text text_type_main-large`}>Лента заказов</h1>
        <ul className={`${styles.list} custom-scroll`}>
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              showStatus={false}
              to={getFeedOrderPath(order._id)}
            />
          ))}
        </ul>
      </div>
      <OrderStats orders={orders} total={total} totalToday={totalToday} />
    </section>
  );
};
