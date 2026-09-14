/* Очитить конструктор при закрытии попапа с номером заказа. */
import { Preloader } from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useEffect, useState } from 'react';

import { AppHeader } from '@components/app-header/app-header';
import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import { BurgerIngredients } from '@components/burger-ingredients/burger-ingredients';
import { IngredientDetails } from '@components/ingredient-details/ingredient-details';
import { Modal } from '@components/modal/modal';
import { OrderDetails } from '@components/order-details/order-details';
import {
  clearConstructor,
  selectConstructorBun,
  selectConstructorIngredients,
} from '@services/burger-constructor/burger-constructor-slice';
import {
  clearCurrentIngredient,
  selectCurrentIngredient,
  setCurrentIngredient,
} from '@services/current-ingredient/current-ingredient-slice';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import { fetchIngredients } from '@services/ingredients/ingredients-actions';
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

import type { TIngredient } from '@utils/types';

import styles from './app.module.css';

export const App = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIngredientsIsLoading);
  const error = useAppSelector(selectIngredientsError);
  const bun = useAppSelector(selectConstructorBun);
  const fillings = useAppSelector(selectConstructorIngredients);
  const selectedIngredient = useAppSelector(selectCurrentIngredient);
  const orderNumber = useAppSelector(selectOrderNumber);
  const orderIsLoading = useAppSelector(selectOrderIsLoading);
  const orderError = useAppSelector(selectOrderError);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    const request = dispatch(fetchIngredients());

    return (): void => {
      request.abort();
    };
  }, [dispatch]);

  const handleIngredientClick = useCallback(
    (ingredient: TIngredient): void => {
      dispatch(setCurrentIngredient(ingredient));
    },
    [dispatch]
  );

  const handleCloseIngredientModal = useCallback((): void => {
    dispatch(clearCurrentIngredient());
  }, [dispatch]);

  const handleOpenOrderModal = useCallback((): void => {
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
  }, [bun, dispatch, fillings]);

  const handleCloseOrderModal = useCallback((): void => {
    if (orderNumber !== null) {
      dispatch(clearConstructor());
    }

    setIsOrderModalOpen(false);
    dispatch(clearOrder());
  }, [dispatch, orderNumber]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <main className={`${styles.main} pl-5 pr-5`}>
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
            <BurgerIngredients onIngredientClick={handleIngredientClick} />
            <BurgerConstructor onOrderClick={handleOpenOrderModal} />
          </div>
        )}
      </main>
      {selectedIngredient && (
        <Modal onClose={handleCloseIngredientModal} title="Детали ингредиента">
          <IngredientDetails ingredient={selectedIngredient} />
        </Modal>
      )}
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
    </div>
  );
};

export default App;
