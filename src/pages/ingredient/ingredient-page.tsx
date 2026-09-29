import { Preloader } from '@krgaa/react-developer-burger-ui-components';
import { useNavigate, useParams } from 'react-router-dom';

import { IngredientDetails } from '@components/ingredient-details/ingredient-details';
import { Modal } from '@components/modal/modal';
import { useAppSelector } from '@services/hooks';
import {
  selectIngredients,
  selectIngredientsIsLoading,
} from '@services/ingredients/ingredients-slice';

import styles from './ingredient-page.module.css';

export const IngredientPage = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const isLoading = useAppSelector(selectIngredientsIsLoading);
  const ingredients = useAppSelector(selectIngredients);
  const ingredient = ingredients.find((item) => item._id === id);

  if (isLoading) {
    return (
      <div className={styles.status}>
        <Preloader />
      </div>
    );
  }

  if (!ingredient) {
    return (
      <p className={`${styles.status} text text_type_main-medium`}>
        Ингредиент не найден
      </p>
    );
  }

  return (
    <section className={styles.page}>
      <h1 className="text text_type_main-large">Детали ингредиента</h1>
      <IngredientDetails ingredient={ingredient} />
    </section>
  );
};

export const IngredientModal = (): React.JSX.Element | null => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ingredients = useAppSelector(selectIngredients);
  const ingredient = ingredients.find((item) => item._id === id);

  const handleClose = (): void => {
    void navigate(-1);
  };

  if (!ingredient) {
    return null;
  }

  return (
    <Modal onClose={handleClose} title="Детали ингредиента">
      <IngredientDetails ingredient={ingredient} />
    </Modal>
  );
};
