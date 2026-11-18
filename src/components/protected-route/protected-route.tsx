/* S4.2 2: Собрать один тип состояния маршрута TLocationState */
import { Preloader } from '@krgaa/react-developer-burger-ui-components';
import { Navigate, useLocation } from 'react-router-dom';

import { selectIsAuthChecked, selectUser } from '@services/auth/auth-slice';
import { useAppSelector } from '@services/hooks';
import { ROUTES } from '@utils/constants';

import type { TLocationState } from '@utils/types';

type TProtectedRouteProps = {
  children: React.JSX.Element;
  onlyUnAuth?: boolean;
};

export const ProtectedRoute = ({
  children,
  onlyUnAuth = false,
}: TProtectedRouteProps): React.JSX.Element => {
  const user = useAppSelector(selectUser);
  const isAuthChecked = useAppSelector(selectIsAuthChecked);
  const location = useLocation();
  const from = (location.state as TLocationState | null)?.from ?? ROUTES.HOME;

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (onlyUnAuth && user) {
    return <Navigate replace to={from} />;
  }

  if (!onlyUnAuth && !user) {
    return (
      <Navigate
        replace
        state={{ from: location.pathname } satisfies TLocationState}
        to={ROUTES.LOGIN}
      />
    );
  }

  return children;
};
