// S4.6 Страница reset-password с формой сброса пароля
import {
  Button,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useForm } from '@hooks/useForm';
import { resetPassword } from '@services/auth/auth-actions';
import {
  clearAuthError,
  selectAuthError,
  selectAuthIsLoading,
} from '@services/auth/auth-slice';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import { isResetPasswordAllowed, setResetPasswordAllowed } from '@utils/auth';
import { ROUTES } from '@utils/constants';

import styles from '../auth/auth-form.module.css';

export const ResetPasswordPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const error = useAppSelector(selectAuthError);
  const isLoading = useAppSelector(selectAuthIsLoading);
  const { values, handleChange } = useForm({
    password: '',
    token: '',
  });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();

      void dispatch(resetPassword(values)).then((result): void => {
        if (!resetPassword.fulfilled.match(result)) {
          return;
        }

        setResetPasswordAllowed(false);
        void navigate(ROUTES.LOGIN);
      });
    },
    [dispatch, navigate, values]
  );

  if (!isResetPasswordAllowed()) {
    return <Navigate replace to={ROUTES.FORGOT_PASSWORD} />;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={`${styles.title} text text_type_main-medium mb-6`}>
        Восстановление пароля
      </h1>
      {error && (
        <p className={`${styles.error} text text_type_main-default mb-6`}>{error}</p>
      )}
      <PasswordInput
        extraClass="mb-6"
        name="password"
        onChange={handleChange}
        placeholder="Введите новый пароль"
        value={values.password}
      />
      <Input
        extraClass="mb-6"
        name="token"
        onChange={handleChange}
        placeholder="Введите код из письма"
        type="text"
        value={values.token}
      />
      <Button disabled={isLoading} htmlType="submit" size="medium" type="primary">
        Сохранить
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
