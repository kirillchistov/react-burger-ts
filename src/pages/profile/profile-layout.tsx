import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { logoutUser } from '@services/auth/auth-actions';
import { useAppDispatch } from '@services/hooks';
import { ROUTES } from '@utils/constants';

import styles from './profile-layout.module.css';

export const ProfileLayout = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    void dispatch(logoutUser())
      .unwrap()
      .catch((): void => undefined)
      .finally((): void => {
        void navigate(ROUTES.LOGIN);
      });
  };

  return (
    <div className={styles.layout}>
      <nav className={styles.menu}>
        <NavLink
          className={({ isActive }): string =>
            `${styles.link} text text_type_main-medium ${isActive ? styles.linkActive : 'text_color_inactive'}`
          }
          end
          to={ROUTES.PROFILE}
        >
          Профиль
        </NavLink>
        <NavLink
          className={({ isActive }): string =>
            `${styles.link} text text_type_main-medium ${isActive ? styles.linkActive : 'text_color_inactive'}`
          }
          to={ROUTES.PROFILE_ORDERS}
        >
          История заказов
        </NavLink>
        <button
          className={`${styles.link} ${styles.logout} text text_type_main-medium text_color_inactive`}
          onClick={handleLogout}
          type="button"
        >
          Выход
        </button>
        <p className={`${styles.hint} text text_type_main-default text_color_inactive`}>
          В этом разделе вы можете изменить свои персональные данные
        </p>
      </nav>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};
