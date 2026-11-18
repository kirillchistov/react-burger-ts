// S3.3.1: Вынести LoginPage в отдельный компонент с формой авторизации
// S3.5 Добавить LoginPage к логике авторизации и регистрации
// S3.9 По мотивам ревью, переделал на useForm
import {
  Button,
  EmailInput,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useForm } from '@hooks/useForm';
import { loginUser } from '@services/auth/auth-actions';
import { selectAuthError, selectAuthIsLoading } from '@services/auth/auth-slice';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import { ROUTES } from '@utils/constants';

import styles from '../auth/auth-form.module.css';

export const LoginPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const isLoading = useAppSelector(selectAuthIsLoading);
  const { values, handleChange } = useForm({
    email: '',
    password: '',
  });

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      void dispatch(loginUser(values));
    },
    [dispatch, values]
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={`${styles.title} text text_type_main-medium mb-6`}>Вход</h1>
      {error && (
        <p className={`${styles.error} text text_type_main-default mb-6`}>{error}</p>
      )}
      <EmailInput
        extraClass="mb-6"
        name="email"
        onChange={handleChange}
        placeholder="E-mail"
        value={values.email}
      />
      <PasswordInput
        extraClass="mb-6"
        name="password"
        onChange={handleChange}
        placeholder="Пароль"
        value={values.password}
      />
      <Button disabled={isLoading} htmlType="submit" size="medium" type="primary">
        Войти
      </Button>
      <div className={styles.links}>
        <p
          className={`${styles.linkLine} text text_type_main-default text_color_inactive`}
        >
          Вы — новый пользователь?
          <Link className={styles.link} to={ROUTES.REGISTER}>
            Зарегистрироваться
          </Link>
        </p>
        <p
          className={`${styles.linkLine} text text_type_main-default text_color_inactive`}
        >
          Забыли пароль?
          <Link className={styles.link} to={ROUTES.FORGOT_PASSWORD}>
            Восстановить пароль
          </Link>
        </p>
      </div>
    </form>
  );
};
