// S4.5 Страница forgot-password с формой восстановления пароля
import { Button, EmailInput } from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useForm } from '@hooks/useForm';
import { forgotPassword } from '@services/auth/auth-actions';
import {
  clearAuthError,
  selectAuthError,
  selectAuthIsLoading,
} from '@services/auth/auth-slice';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import { setResetPasswordAllowed } from '@utils/auth';
import { ROUTES } from '@utils/constants';

import styles from '../auth/auth-form.module.css';

export const ForgotPasswordPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const error = useAppSelector(selectAuthError);
  const isLoading = useAppSelector(selectAuthIsLoading);
  const { values, handleChange } = useForm({
    email: '',
  });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();

      void dispatch(forgotPassword(values.email)).then((result): void => {
        if (!forgotPassword.fulfilled.match(result)) {
          return;
        }

        setResetPasswordAllowed(true);
        void navigate(ROUTES.RESET_PASSWORD);
      });
    },
    [dispatch, navigate, values.email]
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={`${styles.title} text text_type_main-medium mb-6`}>
        Восстановление пароля
      </h1>
      {error && (
        <p className={`${styles.error} text text_type_main-default mb-6`}>{error}</p>
      )}
      <EmailInput
        extraClass="mb-6"
        name="email"
        onChange={handleChange}
        placeholder="Укажите e-mail"
        value={values.email}
      />
      <Button disabled={isLoading} htmlType="submit" size="medium" type="primary">
        Восстановить
      </Button>
      <div className={styles.links}>
        <p
          className={`${styles.linkLine} text text_type_main-default text_color_inactive`}
        >
          Вспомнили пароль?
          <Link className={styles.link} to={ROUTES.LOGIN}>
            Войти
          </Link>
        </p>
      </div>
    </form>
  );
};
