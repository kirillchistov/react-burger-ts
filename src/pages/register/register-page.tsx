// S3.3.1: Вынести RegisterPage в отдельный компонент с формой регистрации
import {
  Button,
  EmailInput,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import { registerUser } from '@services/auth/auth-actions';
import { selectAuthError, selectAuthIsLoading } from '@services/auth/auth-slice';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import { ROUTES } from '@utils/constants';

import styles from '../auth/auth-form.module.css';

export const RegisterPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const isLoading = useAppSelector(selectAuthIsLoading);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setName(event.target.value);
    },
    []
  );

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
      void dispatch(registerUser({ email, name, password }));
    },
    [dispatch, email, name, password]
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={`${styles.title} text text_type_main-medium`}>Регистрация</h1>
      {error && <p className={`${styles.error} text text_type_main-default`}>{error}</p>}
      <Input
        extraClass="mb-6"
        name="name"
        onChange={handleNameChange}
        placeholder="Имя"
        type="text"
        value={name}
      />
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
        Зарегистрироваться
      </Button>
      <div className={styles.links}>
        <p
          className={`${styles.linkLine} text text_type_main-default text_color_inactive`}
        >
          Уже зарегистрированы?
          <Link className={styles.link} to={ROUTES.LOGIN}>
            Войти
          </Link>
        </p>
      </div>
    </form>
  );
};
