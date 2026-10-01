// S3.3.4: Создать заглушку ProfileOrderPage для будущей истории заказов пользователя
import styles from '../stub/stub-page.module.css';

export const ProfileOrdersPage = (): React.JSX.Element => (
  <section className={`${styles.page} ${styles.pageCompact}`}>
    <h1 className="text text_type_main-medium mb-6">История заказов</h1>
    <p className="text text_type_main-default text_color_inactive">
      Страница находится в разработке
    </p>
  </section>
);
