import { Counter, CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';

import type { TIngredient } from '@utils/types';

import styles from './ingredient-item.module.css';

type TIngredientItemProps = {
  count?: number;
  ingredient: TIngredient;
  onClick?: (ingredient: TIngredient) => void;
};

export const IngredientItem = ({
  count = 0,
  ingredient,
  onClick,
}: TIngredientItemProps): React.JSX.Element => {
  const handleClick = (): void => {
    onClick?.(ingredient);
  };

  return (
    <li className={styles.card}>
      <div
        className={styles.content}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className={styles.imageWrap}>
          {count > 0 && (
            <Counter count={count} extraClass={styles.counter} size="default" />
          )}
          <img alt={ingredient.name} className={styles.image} src={ingredient.image} />
        </div>
        <div className={styles.price}>
          <span className="text text_type_digits-default">{ingredient.price}</span>
          <CurrencyIcon type="primary" />
        </div>
        <p className={`${styles.name} text text_type_main-default`}>{ingredient.name}</p>
      </div>
    </li>
  );
};
