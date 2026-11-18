import { formatOrderNumber, splitOrderNumbers } from '@utils/order';

import type { TOrder } from '@utils/types';

import styles from './order-stats.module.css';

type TOrderStatsProps = {
  orders: TOrder[];
  total: number;
  totalToday: number;
};

const byNumberDesc = (left: TOrder, right: TOrder): number => right.number - left.number;

const StatusColumns = ({
  numbers,
  tone,
}: {
  numbers: number[];
  tone?: 'success';
}): React.JSX.Element => {
  const columns = splitOrderNumbers(numbers);

  return (
    <div className={styles.numbers}>
      {columns.map((column) => (
        <ul key={column[0]} className={styles.column}>
          {column.map((number) => (
            <li
              key={number}
              className={`text text_type_digits-default ${tone === 'success' ? 'text_color_success' : ''}`}
            >
              {formatOrderNumber(number).slice(1)}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
};

export const OrderStats = ({
  orders,
  total,
  totalToday,
}: TOrderStatsProps): React.JSX.Element => {
  const done = orders.filter((order) => order.status === 'done').sort(byNumberDesc);
  const inWork = orders
    .filter((order) => order.status === 'pending' || order.status === 'created')
    .sort(byNumberDesc);

  return (
    <aside className={styles.stats}>
      <div className={styles.statuses}>
        <section className={styles.statusBlock}>
          <h2 className={`${styles.title} text text_type_main-medium`}>Готовы:</h2>
          <StatusColumns numbers={done.map((order) => order.number)} tone="success" />
        </section>
        <section className={styles.statusBlock}>
          <h2 className={`${styles.title} text text_type_main-medium`}>В работе:</h2>
          <StatusColumns numbers={inWork.map((order) => order.number)} />
        </section>
      </div>
      <div className={styles.total}>
        <h2 className={`${styles.title} text text_type_main-medium`}>
          Выполнено за все время:
        </h2>
        <p className={`${styles.title} text text_type_digits-large`}>{total}</p>
      </div>
      <div className={styles.total}>
        <h2 className={`${styles.title} text text_type_main-medium`}>
          Выполнено за сегодня:
        </h2>
        <p className={`${styles.title} text text_type_digits-large`}>{totalToday}</p>
      </div>
    </aside>
  );
};
