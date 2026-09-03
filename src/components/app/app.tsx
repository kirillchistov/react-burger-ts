import { Preloader } from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AppHeader } from '@components/app-header/app-header';
import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import { BurgerIngredients } from '@components/burger-ingredients/burger-ingredients';
import { IngredientDetails } from '@components/ingredient-details/ingredient-details';
import { Modal } from '@components/modal/modal';
import { OrderDetails } from '@components/order-details/order-details';
import { getDemoBurger, getIngredientCounts } from '@utils/burger';
import { getErrorMessage, getIngredientsApi } from '@utils/burger-api';

import type { TIngredient } from '@utils/types';

import styles from './app.module.css';

export const App = (): React.JSX.Element => {
  const [ingredients, setIngredients] = useState<TIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<TIngredient | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    getIngredientsApi(controller.signal)
      .then((data) => {
        setIngredients(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return (): void => {
      controller.abort();
    };
  }, []);

  const burger = useMemo(() => getDemoBurger(ingredients), [ingredients]);
  const ingredientCounts = useMemo(() => getIngredientCounts(burger), [burger]);

  const handleIngredientClick = useCallback((ingredient: TIngredient): void => {
    setSelectedIngredient(ingredient);
  }, []);

  const handleCloseIngredientModal = useCallback((): void => {
    setSelectedIngredient(null);
  }, []);

  const handleOpenOrderModal = useCallback((): void => {
    setIsOrderModalOpen(true);
  }, []);

  const handleCloseOrderModal = useCallback((): void => {
    setIsOrderModalOpen(false);
  }, []);

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
            <BurgerIngredients
              counts={ingredientCounts}
              ingredients={ingredients}
              onIngredientClick={handleIngredientClick}
            />
            <BurgerConstructor
              bun={burger.bun}
              fillings={burger.fillings}
              onOrderClick={handleOpenOrderModal}
            />
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
          <OrderDetails />
        </Modal>
      )}
    </div>
  );
};

export default App;
