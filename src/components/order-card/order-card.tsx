import {
  CurrencyIcon,
  FormattedDate,
} from '@krgaa/react-developer-burger-ui-components';
import { Link, useLocation } from 'react-router-dom';

import { useAppSelector } from '@services/hooks';
import { selectIngredients } from '@services/ingredients/ingredients-slice';
import {
  formatOrderNumber,
  getOrderIngredients,
  getOrderPrice,
  ORDER_STATUS_TEXT,
  PREVIEW_INGREDIENT_LIMIT,
} from '@utils/order';

import type { TLocationState, TOrder } from '@utils/types';

import styles from './order-card.module.css';

type TOrderCardProps = {
  order: TOrder;
  showStatus: boolean;
  to: string;
};

export const OrderCard = ({
  order,
  showStatus,
  to,
}: TOrderCardProps): React.JSX.Element => {
  const location = useLocation();
  const ingredients = useAppSelector(selectIngredients);
  const items = getOrderIngredients(order, ingredients);
  const visibleItems = items.slice(0, PREVIEW_INGREDIENT_LIMIT);
  const hiddenCount = items.length - visibleItems.length;
  const createdAt = new Date(order.createdAt);
  const hasDate = !Number.isNaN(createdAt.getTime());
  const state: TLocationState = { background: location };

  return (
    <li>
      <Link
        className={styles.card}
        data-testid={`order-${order._id}`}
        state={state}
        to={to}
      >
        <div className={styles.header}>
          <span className="text text_type_digits-default">
            {formatOrderNumber(order.number)}
          </span>
          {hasDate && (
            <FormattedDate
              className="text text_type_main-default text_color_inactive"
              date={createdAt}
            />
          )}
        </div>
        <h2 className={`${styles.name} text text_type_main-medium`}>{order.name}</h2>
        {showStatus && (
          <p
            className={`${styles.status} text text_type_main-default ${order.status === 'done' ? 'text_color_success' : ''}`}
          >
            {ORDER_STATUS_TEXT[order.status]}
          </p>
        )}
        <div className={styles.bottom}>
          <ul className={styles.preview}>
            {visibleItems.map((item, index) => (
              <li
                key={item.ingredient._id}
                className={styles.previewItem}
                style={{ zIndex: visibleItems.length - index }}
              >
                <img
                  alt={item.ingredient.name}
                  className={styles.previewImage}
                  src={item.ingredient.image_mobile}
                />
                {hiddenCount > 0 && index === visibleItems.length - 1 && (
                  <span className={`${styles.more} text text_type_digits-default`}>
                    +{hiddenCount}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <span className={styles.price}>
            <span className="text text_type_digits-default">{getOrderPrice(items)}</span>
            <CurrencyIcon type="primary" />
          </span>
        </div>
      </Link>
    </li>
  );
};
