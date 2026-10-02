// S3.3.3: Вынести ProfileLayout в отдельный компонент с меню и контентом
// S3.8: Доработка профиля: после logout переход на /login + from
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
            `${styles.link} ${isActive ? styles.linkActive : ''}`
          }
          end
          to={ROUTES.PROFILE}
        >
          <span className="text text_type_main-medium">Профиль</span>
        </NavLink>
        <NavLink
          className={({ isActive }): string =>
            `${styles.link} ${isActive ? styles.linkActive : ''}`
          }
          to={ROUTES.PROFILE_ORDERS}
        >
          <span className="text text_type_main-medium">История заказов</span>
        </NavLink>
        <button className={styles.link} onClick={handleLogout} type="button">
          <span className="text text_type_main-medium">Выход</span>
        </button>
        <p className={styles.hint}>
          <span className="text text_type_main-default text_color_inactive">
            В этом разделе вы можете изменить свои персональные данные
          </span>
        </p>
      </nav>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};
