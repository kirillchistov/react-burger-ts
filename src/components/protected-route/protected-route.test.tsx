import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { rootReducer } from '@services/store';
import { ROUTES } from '@utils/constants';

import { ProtectedRoute } from './protected-route';

import type { TLocationState, TUser } from '@utils/types';

const user: TUser = {
  email: 'ben@example.com',
  name: 'Бен',
};

const LoginProbe = (): React.JSX.Element => {
  const location = useLocation();
  const from = (location.state as TLocationState | null)?.from ?? '';

  return (
    <>
      <p>Вход</p>
      <p data-testid="from">{from}</p>
    </>
  );
};

type TRenderOptions = {
  isAuthChecked: boolean;
  onlyUnAuth?: boolean;
  path: string;
  state?: TLocationState;
  user: TUser | null;
};

const renderProtected = ({
  isAuthChecked,
  onlyUnAuth = false,
  path,
  state,
  user: currentUser,
}: TRenderOptions): void => {
  const store = configureStore({
    preloadedState: {
      auth: {
        error: null,
        isAuthChecked,
        isLoading: false,
        user: currentUser,
      },
    },
    reducer: rootReducer,
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[{ pathname: path, state }]}>
        <Routes>
          <Route
            element={
              <ProtectedRoute onlyUnAuth={onlyUnAuth}>
                <p>Доступ разрешён</p>
              </ProtectedRoute>
            }
            path={path}
          />
          <Route element={<LoginProbe />} path={ROUTES.LOGIN} />
          <Route element={<p>Главная</p>} path={ROUTES.HOME} />
          <Route element={<p>Профиль</p>} path={ROUTES.PROFILE} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('ProtectedRoute', (): void => {
  it('пока сессия не проверена, не показывает страницу', (): void => {
    renderProtected({
      isAuthChecked: false,
      path: ROUTES.PROFILE,
      user: null,
    });

    expect(screen.queryByText('Доступ разрешён')).not.toBeInTheDocument();
    expect(screen.queryByText('Вход')).not.toBeInTheDocument();
  });

  it('гостя с защищённого маршрута отправляет на логин и сохраняет from', (): void => {
    renderProtected({
      isAuthChecked: true,
      path: ROUTES.PROFILE_ORDERS,
      user: null,
    });

    expect(screen.getByText('Вход')).toBeInTheDocument();
    expect(screen.getByTestId('from')).toHaveTextContent(ROUTES.PROFILE_ORDERS);
    expect(screen.queryByText('Доступ разрешён')).not.toBeInTheDocument();
  });

  it('авторизованному показывает защищённую страницу', (): void => {
    renderProtected({
      isAuthChecked: true,
      path: ROUTES.PROFILE,
      user,
    });

    expect(screen.getByText('Доступ разрешён')).toBeInTheDocument();
    expect(screen.queryByText('Вход')).not.toBeInTheDocument();
  });

  it('onlyUnAuth пускает гостя', (): void => {
    renderProtected({
      isAuthChecked: true,
      onlyUnAuth: true,
      path: ROUTES.LOGIN,
      user: null,
    });

    expect(screen.getByText('Доступ разрешён')).toBeInTheDocument();
  });

  it('onlyUnAuth уводит пользователя на from из стейта', (): void => {
    renderProtected({
      isAuthChecked: true,
      onlyUnAuth: true,
      path: ROUTES.LOGIN,
      state: { from: ROUTES.PROFILE },
      user,
    });

    expect(screen.getByText('Профиль')).toBeInTheDocument();
    expect(screen.queryByText('Доступ разрешён')).not.toBeInTheDocument();
  });

  it('onlyUnAuth без from отправляет пользователя на главную', (): void => {
    renderProtected({
      isAuthChecked: true,
      onlyUnAuth: true,
      path: ROUTES.LOGIN,
      user,
    });

    expect(screen.getByText('Главная')).toBeInTheDocument();
    expect(screen.queryByText('Доступ разрешён')).not.toBeInTheDocument();
  });
});
