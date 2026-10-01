// S3.3.2: Страница reset-password с формой сброса пароля
// S3.6.2: Сброс: запрос -> флаг, успех -> переход на /login, нет -> на /forgot-password
import {
  Button,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { resetPassword } from '@services/auth/auth-actions';
import { useAppDispatch } from '@services/hooks';
import { isResetPasswordAllowed, setResetPasswordAllowed } from '@utils/auth';
import { ROUTES } from '@utils/constants';

import styles from '../auth/auth-form.module.css';

export const ResetPasswordPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setPassword(event.target.value);
    },
    []
  );

  const handleTokenChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setToken(event.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      setError(null);
      setIsLoading(true);

      void dispatch(resetPassword({ password, token }))
        .unwrap()
        .then((): void => {
          setResetPasswordAllowed(false);
          void navigate(ROUTES.LOGIN);
        })
        .catch((message: string): void => {
          setError(message);
        })
        .finally((): void => {
          setIsLoading(false);
        });
    },
    [dispatch, navigate, password, token]
  );

  if (!isResetPasswordAllowed()) {
    return <Navigate replace to={ROUTES.FORGOT_PASSWORD} />;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={`${styles.title} text text_type_main-medium`}>
        Восстановление пароля
      </h1>
      {error && <p className={`${styles.error} text text_type_main-default`}>{error}</p>}
      <PasswordInput
        extraClass="mb-6"
        name="password"
        onChange={handlePasswordChange}
        placeholder="Введите новый пароль"
        value={password}
      />
      <Input
        extraClass="mb-6"
        name="token"
        onChange={handleTokenChange}
        placeholder="Введите код из письма"
        type="text"
        value={token}
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
