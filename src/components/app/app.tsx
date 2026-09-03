import { Preloader } from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useMemo, useState } from 'react';

import { AppHeader } from '@components/app-header/app-header';
import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import { BurgerIngredients } from '@components/burger-ingredients/burger-ingredients';
import { getDemoBurger, getIngredientCounts } from '@utils/burger';
import { getErrorMessage, getIngredientsApi } from '@utils/burger-api';

import type { TIngredient } from '@utils/types';

import styles from './app.module.css';

export const App = (): React.JSX.Element => {
  const [ingredients, setIngredients] = useState<TIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <BurgerIngredients counts={ingredientCounts} ingredients={ingredients} />
            <BurgerConstructor bun={burger.bun} fillings={burger.fillings} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
