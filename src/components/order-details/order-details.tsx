import { CheckMarkIcon } from '@krgaa/react-developer-burger-ui-components';

import { DEMO_ORDER } from '@utils/constants';

import styles from './order-details.module.css';

export const OrderDetails = (): React.JSX.Element => {
  return (
    <div className={styles.details}>
      <p className={`${styles.number} text text_type_digits-large`}>
        {DEMO_ORDER.number}
      </p>
      <p className="text text_type_main-medium mt-8">идентификатор заказа</p>
      <div className={styles.statusIcon}>
        <CheckMarkIcon type="primary" />
      </div>
      <p className="text text_type_main-default">{DEMO_ORDER.status}</p>
      <p className="text text_type_main-default text_color_inactive mt-2">
        {DEMO_ORDER.hint}
      </p>
    </div>
  );
};
