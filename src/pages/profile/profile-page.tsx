import { Button, Input } from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { updateUser } from '@services/auth/auth-actions';
import {
  selectAuthError,
  selectAuthIsLoading,
  selectUser,
} from '@services/auth/auth-slice';
import { useAppDispatch, useAppSelector } from '@services/hooks';

import styles from './profile-page.module.css';

type TProfileForm = {
  email: string;
  name: string;
  password: string;
};

export const ProfilePage = (): React.JSX.Element | null => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const error = useAppSelector(selectAuthError);
  const isLoading = useAppSelector(selectAuthIsLoading);
  const [form, setForm] = useState<TProfileForm>({
    email: '',
    name: '',
    password: '',
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      email: user.email,
      name: user.name,
      password: '',
    });
  }, [user]);

  const isDirty = useMemo(
    () =>
      Boolean(user) &&
      (form.name !== user?.name ||
        form.email !== user.email ||
        form.password.length > 0),
    [form, user]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const fieldName = event.target.name;

      if (fieldName !== 'email' && fieldName !== 'name' && fieldName !== 'password') {
        return;
      }

      setForm((current) => ({ ...current, [fieldName]: event.target.value }));
    },
    []
  );

  const handleCancel = useCallback((): void => {
    if (!user) {
      return;
    }

    setForm({
      email: user.email,
      name: user.name,
      password: '',
    });
  }, [user]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      void dispatch(
        updateUser({
          email: form.email,
          name: form.name,
          ...(form.password.length > 0 ? { password: form.password } : {}),
        })
      );
    },
    [dispatch, form]
  );

  if (!user) {
    return null;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <p className={`${styles.error} text text_type_main-default`}>{error}</p>}
      <Input
        extraClass="mb-6"
        icon="EditIcon"
        name="name"
        onChange={handleChange}
        placeholder="Имя"
        type="text"
        value={form.name}
      />
      <Input
        extraClass="mb-6"
        icon="EditIcon"
        name="email"
        onChange={handleChange}
        placeholder="Логин"
        type="email"
        value={form.email}
      />
      <Input
        extraClass="mb-6"
        icon="EditIcon"
        name="password"
        onChange={handleChange}
        placeholder="Пароль"
        type="password"
        value={form.password}
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
