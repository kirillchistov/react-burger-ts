import { CheckMarkIcon } from '@krgaa/react-developer-burger-ui-components';

import { useAppSelector } from '@services/hooks';
import { selectOrderNumber } from '@services/order/order-slice';

import styles from './order-details.module.css';

export const OrderDetails = (): React.JSX.Element => {
  const orderNumber = useAppSelector(selectOrderNumber);

  return (
    <div className={styles.details}>
      <p className={`${styles.number} text text_type_digits-large`}>{orderNumber}</p>
      <p className="text text_type_main-medium mt-8">идентификатор заказа</p>
      <div className={styles.statusIcon}>
        <CheckMarkIcon type="primary" />
      </div>
      <p className="text text_type_main-default">Ваш заказ начали готовить</p>
      <p className="text text_type_main-default text_color_inactive mt-2">
        Дождитесь готовности на орбитальной станции
      </p>
    </div>
  );
};
