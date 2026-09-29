import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { NavLink } from 'react-router-dom';

import { ROUTES } from '@utils/constants';

import styles from './app-header.module.css';

export const AppHeader = (): React.JSX.Element => {
  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <ul className={styles.menuPartLeft}>
          <li>
            <NavLink className={styles.link} end to={ROUTES.HOME}>
              {({ isActive }): React.JSX.Element => (
                <>
                  <BurgerIcon type={isActive ? 'primary' : 'secondary'} />
                  <span
                    className={`${styles.linkText} text text_type_main-default ${isActive ? styles.linkActive : 'text_color_inactive'}`}
                  >
                    Конструктор
                  </span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink className={styles.link} to={ROUTES.FEED}>
              {({ isActive }): React.JSX.Element => (
                <>
                  <ListIcon type={isActive ? 'primary' : 'secondary'} />
                  <span
                    className={`${styles.linkText} text text_type_main-default ${isActive ? styles.linkActive : 'text_color_inactive'}`}
                  >
                    Лента заказов
                  </span>
                </>
              )}
            </NavLink>
          </li>
        </ul>
        <NavLink aria-label="Stellar Burgers" className={styles.logo} to={ROUTES.HOME}>
          <Logo />
        </NavLink>
        <NavLink
          className={`${styles.link} ${styles.linkPositionLast}`}
          to={ROUTES.PROFILE}
        >
          {({ isActive }): React.JSX.Element => (
            <>
              <ProfileIcon type={isActive ? 'primary' : 'secondary'} />
              <span
                className={`${styles.linkText} text text_type_main-default ${isActive ? styles.linkActive : 'text_color_inactive'}`}
              >
                Личный кабинет
              </span>
            </>
          )}
        </NavLink>
      </nav>
    </header>
  );
};
