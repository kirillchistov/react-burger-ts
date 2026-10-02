// S3.3.1: Вынести RegisterPage в отдельный компонент с формой регистрации
// S3.5 Добавить RegisterPage к логике авторизации и регистрации
// S3.9 По мотивам ревью, переделал на useForm
import {
  Button,
  EmailInput,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useForm } from '@hooks/useForm';
import { registerUser } from '@services/auth/auth-actions';
import { selectAuthError, selectAuthIsLoading } from '@services/auth/auth-slice';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import { ROUTES } from '@utils/constants';

import styles from '../auth/auth-form.module.css';

export const RegisterPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const isLoading = useAppSelector(selectAuthIsLoading);
  const { values, handleChange } = useForm({
    email: '',
    name: '',
    password: '',
  });

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      void dispatch(registerUser(values));
    },
    [dispatch, values]
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={`${styles.title} text text_type_main-medium`}>Регистрация</h1>
      {error && <p className={`${styles.error} text text_type_main-default`}>{error}</p>}
      <Input
        extraClass="mb-6"
        name="name"
        onChange={handleChange}
        placeholder="Имя"
        type="text"
        value={values.name}
      />
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
