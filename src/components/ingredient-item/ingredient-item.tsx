import { Counter, CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import { useCallback } from 'react';
import { useDrag } from 'react-dnd';

import { DND_TYPES } from '@utils/dnd';

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
  const [{ isDragging }, dragRef] = useDrag<TIngredient, void, { isDragging: boolean }>({
    collect: (monitor): { isDragging: boolean } => ({
      isDragging: monitor.isDragging(),
    }),
    item: ingredient,
    type: ingredient.type === 'bun' ? DND_TYPES.BUN : DND_TYPES.FILLING,
  });

  const handleClick = useCallback((): void => {
    onClick?.(ingredient);
  }, [ingredient, onClick]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const setDragRef = (node: HTMLDivElement | null): void => {
    dragRef(node);
  };

  return (
    <li className={styles.card}>
      <div
        className={styles.content}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        ref={setDragRef}
        role="button"
        style={{ opacity: isDragging ? 0.4 : 1 }}
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
