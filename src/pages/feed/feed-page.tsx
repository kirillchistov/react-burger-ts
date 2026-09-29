import { Link } from 'react-router-dom';

import { ROUTES } from '@utils/constants';

import styles from '../stub/stub-page.module.css';

export const FeedPage = (): React.JSX.Element => (
  <section className={styles.page}>
    <h1 className="text text_type_main-medium mb-6">Лента заказов</h1>
    <p className="text text_type_main-default text_color_inactive">
      Страница находится в разработке
    </p>
    <Link
      className={`${styles.link} text text_type_main-default mt-10`}
      to={ROUTES.HOME}
    >
      Вернуться на главную
    </Link>
  </section>
);
