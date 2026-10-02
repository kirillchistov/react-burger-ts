// S3.3.3: Вынести ProfilePage в отдельный компонент с формой профиля
// S3.8: Доработка профиля: изменение, отмена, сохранение, очистка формы
// S3.9 По мотивам ревью, переделал на useForm
import { Button, Input } from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useEffect, useMemo } from 'react';

import { useForm } from '@hooks/useForm';
import { updateUser } from '@services/auth/auth-actions';
import {
  selectAuthError,
  selectAuthIsLoading,
  selectUser,
} from '@services/auth/auth-slice';
import { useAppDispatch, useAppSelector } from '@services/hooks';

import styles from './profile-page.module.css';

export const ProfilePage = (): React.JSX.Element | null => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const error = useAppSelector(selectAuthError);
  const isLoading = useAppSelector(selectAuthIsLoading);
  const { values, handleChange, setValues } = useForm({
    email: '',
    name: '',
    password: '',
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setValues({
      email: user.email,
      name: user.name,
      password: '',
    });
  }, [setValues, user]);

  const isDirty = useMemo(
    () =>
      Boolean(user) &&
      (values.name !== user?.name ||
        values.email !== user.email ||
        values.password.length > 0),
    [user, values]
  );

  const handleCancel = useCallback((): void => {
    if (!user) {
      return;
    }

    setValues({
      email: user.email,
      name: user.name,
      password: '',
    });
  }, [setValues, user]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      void dispatch(
        updateUser({
          email: values.email,
          name: values.name,
          ...(values.password.length > 0 ? { password: values.password } : {}),
        })
      );
    },
    [dispatch, values]
  );

  if (!user) {
    return null;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && (
        <p className={`${styles.error} text text_type_main-default mb-6`}>{error}</p>
      )}
      <Input
        extraClass="mb-6"
        icon="EditIcon"
        name="name"
        onChange={handleChange}
        placeholder="Имя"
        type="text"
        value={values.name}
      />
      <Input
        extraClass="mb-6"
        icon="EditIcon"
        name="email"
        onChange={handleChange}
        placeholder="Логин"
        type="email"
        value={values.email}
      />
      <Input
        extraClass="mb-6"
        icon="EditIcon"
        name="password"
        onChange={handleChange}
        placeholder="Пароль"
        type="password"
        value={values.password}
      />
      {isDirty && (
        <div className={styles.actions}>
          <Button
            htmlType="button"
            onClick={handleCancel}
            size="medium"
            type="secondary"
          >
            Отмена
          </Button>
          <Button disabled={isLoading} htmlType="submit" size="medium" type="primary">
            Сохранить
          </Button>
        </div>
      )}
    </form>
  );
};
