import { Preloader } from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';

import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import { BurgerIngredients } from '@components/burger-ingredients/burger-ingredients';
import { Modal } from '@components/modal/modal';
import { OrderDetails } from '@components/order-details/order-details';
import { selectUser } from '@services/auth/auth-slice';
import {
  clearConstructor,
  selectConstructorBun,
  selectConstructorIngredients,
} from '@services/burger-constructor/burger-constructor-slice';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import {
  selectIngredientsError,
  selectIngredientsIsLoading,
} from '@services/ingredients/ingredients-slice';
import { createOrder } from '@services/order/order-actions';
import {
  clearOrder,
  selectOrderError,
  selectOrderIsLoading,
  selectOrderNumber,
} from '@services/order/order-slice';
import { ROUTES } from '@utils/constants';

import styles from './home.module.css';

export const Home = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoading = useAppSelector(selectIngredientsIsLoading);
  const error = useAppSelector(selectIngredientsError);
  const bun = useAppSelector(selectConstructorBun);
  const fillings = useAppSelector(selectConstructorIngredients);
  const user = useAppSelector(selectUser);
  const orderNumber = useAppSelector(selectOrderNumber);
  const orderIsLoading = useAppSelector(selectOrderIsLoading);
  const orderError = useAppSelector(selectOrderError);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const handleOpenOrderModal = useCallback((): void => {
    if (!user) {
      void navigate(ROUTES.LOGIN, { state: { from: ROUTES.HOME } });
      return;
    }

    if (!bun) {
      return;
    }

    const ingredientIds = [
      bun._id,
      ...fillings.map((ingredient) => ingredient._id),
      bun._id,
    ];

    setIsOrderModalOpen(true);
    void dispatch(createOrder(ingredientIds));
  }, [bun, dispatch, fillings, navigate, user]);

  const handleCloseOrderModal = useCallback((): void => {
    if (orderNumber !== null) {
      dispatch(clearConstructor());
    }

    setIsOrderModalOpen(false);
    dispatch(clearOrder());
  }, [dispatch, orderNumber]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.home}>
        {isLoading && (
          <div className={styles.status}>
            <Preloader />
          </div>
        )}
        {error && (
          <p className={`${styles.status} text text_type_main-medium`}>{error}</p>
        )}
        {!isLoading && !error && (
          <div className={styles.columns}>
            <BurgerIngredients />
            <BurgerConstructor onOrderClick={handleOpenOrderModal} />
          </div>
        )}
      </div>
      {isOrderModalOpen && (
        <Modal onClose={handleCloseOrderModal}>
          {orderIsLoading && (
            <div className={styles.status}>
              <Preloader />
            </div>
          )}
          {orderError && (
            <p className="text text_type_main-medium mb-15">{orderError}</p>
          )}
          {orderNumber !== null && <OrderDetails />}
        </Modal>
      )}
    </DndProvider>
  );
};
