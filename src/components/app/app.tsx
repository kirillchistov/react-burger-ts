import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { AppHeader } from '@components/app-header/app-header';
import { ProtectedRoute } from '@components/protected-route/protected-route';
import { FeedPage } from '@pages/feed/feed-page';
import { ForgotPasswordPage } from '@pages/forgot-password/forgot-password-page';
import { Home } from '@pages/home/home';
import { IngredientModal, IngredientPage } from '@pages/ingredient/ingredient-page';
import { LoginPage } from '@pages/login/login-page';
import { NotFoundPage } from '@pages/not-found/not-found-page';
import { ProfileLayout } from '@pages/profile/profile-layout';
import { ProfileOrdersPage } from '@pages/profile/profile-orders-page';
import { ProfilePage } from '@pages/profile/profile-page';
import { RegisterPage } from '@pages/register/register-page';
import { ResetPasswordPage } from '@pages/reset-password/reset-password-page';
import { getUser } from '@services/auth/auth-actions';
import { useAppDispatch } from '@services/hooks';
import { fetchIngredients } from '@services/ingredients/ingredients-actions';
import { ROUTES } from '@utils/constants';

import type { Location } from 'react-router-dom';

import styles from './app.module.css';

type TLocationState = {
  background?: Location;
};

export const App = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const background = (location.state as TLocationState | null)?.background;

  useEffect(() => {
    const request = dispatch(fetchIngredients());
    void dispatch(getUser());

    return (): void => {
      request.abort();
    };
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <main className={`${styles.main} pl-5 pr-5`}>
        <Routes location={background ?? location}>
          <Route element={<Home />} path={ROUTES.HOME} />
          <Route element={<IngredientPage />} path={ROUTES.INGREDIENT} />
          <Route
            element={
              <ProtectedRoute onlyUnAuth>
                <LoginPage />
              </ProtectedRoute>
            }
            path={ROUTES.LOGIN}
          />
          <Route
            element={
              <ProtectedRoute onlyUnAuth>
                <RegisterPage />
              </ProtectedRoute>
            }
            path={ROUTES.REGISTER}
          />
          <Route
            element={
              <ProtectedRoute onlyUnAuth>
                <ForgotPasswordPage />
              </ProtectedRoute>
            }
            path={ROUTES.FORGOT_PASSWORD}
          />
          <Route
            element={
              <ProtectedRoute onlyUnAuth>
                <ResetPasswordPage />
              </ProtectedRoute>
            }
            path={ROUTES.RESET_PASSWORD}
          />
          <Route
            element={
              <ProtectedRoute>
                <ProfileLayout />
              </ProtectedRoute>
            }
            path={ROUTES.PROFILE}
          >
            <Route element={<ProfilePage />} index />
            <Route element={<ProfileOrdersPage />} path="orders" />
          </Route>
          <Route element={<FeedPage />} path={ROUTES.FEED} />
          <Route element={<NotFoundPage />} path="*" />
        </Routes>
        {background && (
          <Routes>
            <Route element={<IngredientModal />} path={ROUTES.INGREDIENT} />
          </Routes>
        )}
      </main>
    </div>
  );
};

export default App;
