// S3.3.5: Создать заглушку NotFoundPage для страницы 404
// Стили - копия stub-page.module.css, сразу вынес отдельно
import { Link } from 'react-router-dom';

import { ROUTES } from '@utils/constants';

import styles from '../error/error-page.module.css';

export const NotFoundPage = (): React.JSX.Element => (
  <section className={styles.page}>
    <h1 className="text text_type_digits-large mb-6">404</h1>
    <p className="text text_type_main-medium mb-10">Страница не найдена</p>
    <Link className={`${styles.link} text text_type_main-default`} to={ROUTES.HOME}>
      Вернуться на главную
    </Link>
  </section>
);
