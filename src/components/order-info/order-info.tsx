import {
  CurrencyIcon,
  FormattedDate,
} from '@krgaa/react-developer-burger-ui-components';

import { useAppSelector } from '@services/hooks';
import { selectIngredients } from '@services/ingredients/ingredients-slice';
import {
  formatOrderNumber,
  getOrderIngredients,
  getOrderPrice,
  ORDER_STATUS_TEXT,
} from '@utils/order';

import type { TOrder } from '@utils/types';

import styles from './order-info.module.css';

type TOrderInfoProps = {
  order: TOrder;
  variant: 'modal' | 'page';
};

export const OrderInfo = ({ order, variant }: TOrderInfoProps): React.JSX.Element => {
  const ingredients = useAppSelector(selectIngredients);
  const items = getOrderIngredients(order, ingredients);
  const createdAt = new Date(order.createdAt);
  const hasDate = !Number.isNaN(createdAt.getTime());

  return (
    <div className={styles.info}>
      <div className={variant === 'page' ? styles.pageHead : styles.modalHead}>
        {variant === 'page' && (
          <p className={`${styles.number} text text_type_digits-default`}>
            {formatOrderNumber(order.number)}
          </p>
        )}
        <h2 className={`${styles.name} text text_type_main-medium`}>{order.name}</h2>
        <p
          className={`${styles.status} text text_type_main-default ${order.status === 'done' ? 'text_color_success' : ''}`}
        >
          {ORDER_STATUS_TEXT[order.status]}
        </p>
      </div>
      <h3 className={`${styles.compositionTitle} text text_type_main-medium`}>
        Состав:
      </h3>
      <ul className={`${styles.list} custom-scroll`}>
        {items.map((item) => (
          <li key={item.ingredient._id} className={styles.row}>
            <img
              alt={item.ingredient.name}
              className={styles.image}
              src={item.ingredient.image_mobile}
            />
            <p className={`${styles.ingredientName} text text_type_main-default`}>
              {item.ingredient.name}
            </p>
            <span className={styles.price}>
              <span className="text text_type_digits-default">
                {item.count} x {item.ingredient.price}
              </span>
              <CurrencyIcon type="primary" />
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.footer}>
        {hasDate ? (
          <FormattedDate
            className="text text_type_main-default text_color_inactive"
            date={createdAt}
          />
        ) : (
          <span />
        )}
        <span className={styles.price}>
          <span className="text text_type_digits-default">{getOrderPrice(items)}</span>
          <CurrencyIcon type="primary" />
        </span>
      </div>
    </div>
  );
};
