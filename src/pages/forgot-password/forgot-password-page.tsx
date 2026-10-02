// S3.3.2: Страница forgot-password с формой восстановления пароля
// S3.6.1: Восстановление пароля: запрос, флаг в localStorage, переход на /reset-password
// S3.9 По мотивам ревью, переделал на useForm
import { Button, EmailInput } from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useForm } from '@hooks/useForm';
import { forgotPassword } from '@services/auth/auth-actions';
import { useAppDispatch } from '@services/hooks';
import { setResetPasswordAllowed } from '@utils/auth';
import { ROUTES } from '@utils/constants';

import styles from '../auth/auth-form.module.css';

export const ForgotPasswordPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { values, handleChange } = useForm({
    email: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      setError(null);
      setIsLoading(true);

      void dispatch(forgotPassword(values.email))
        .unwrap()
        .then((): void => {
          setResetPasswordAllowed(true);
          void navigate(ROUTES.RESET_PASSWORD);
        })
        .catch((message: string): void => {
          setError(message);
        })
        .finally((): void => {
          setIsLoading(false);
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
