// S3.3.1: Вынести LoginPage в отдельный компонент с формой авторизации
import {
  Button,
  EmailInput,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import { loginUser } from '@services/auth/auth-actions';
import { selectAuthError, selectAuthIsLoading } from '@services/auth/auth-slice';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import { ROUTES } from '@utils/constants';

import styles from '../auth/auth-form.module.css';

export const LoginPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const isLoading = useAppSelector(selectAuthIsLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setEmail(event.target.value);
    },
    []
  );

  const handlePasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setPassword(event.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      void dispatch(loginUser({ email, password }));
    },
    [dispatch, email, password]
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={`${styles.title} text text_type_main-medium`}>Вход</h1>
      {error && <p className={`${styles.error} text text_type_main-default`}>{error}</p>}
      <EmailInput
        extraClass="mb-6"
        name="email"
        onChange={handleEmailChange}
        placeholder="E-mail"
        value={email}
      />
      <PasswordInput
        extraClass="mb-6"
        name="password"
        onChange={handlePasswordChange}
        placeholder="Пароль"
        value={password}
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
