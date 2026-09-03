import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon,
} from '@krgaa/react-developer-burger-ui-components';

import styles from './app-header.module.css';

export const AppHeader = (): React.JSX.Element => {
  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <ul className={styles.menuPartLeft}>
          <li>
            <a href="/" className={`${styles.link} ${styles.linkActive}`}>
              <BurgerIcon type="primary" />
              <span className={`${styles.linkText} text text_type_main-default`}>
                Конструктор
              </span>
            </a>
          </li>
          <li>
            <a href="/feed" className={styles.link}>
              <ListIcon type="secondary" />
              <span
                className={`${styles.linkText} text text_type_main-default text_color_inactive`}
              >
                Лента заказов
              </span>
            </a>
          </li>
        </ul>
        <a href="/" className={styles.logo} aria-label="Stellar Burgers">
          <Logo />
        </a>
        <a href="/profile" className={`${styles.link} ${styles.linkPositionLast}`}>
          <ProfileIcon type="secondary" />
          <span
            className={`${styles.linkText} text text_type_main-default text_color_inactive`}
          >
            Личный кабинет
          </span>
        </a>
      </nav>
    </header>
  );
};
