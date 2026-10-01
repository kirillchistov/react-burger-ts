import {
  ConstructorElement,
  DragIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import {
  moveIngredient,
  removeIngredient,
} from '@services/burger-constructor/burger-constructor-slice';
import { useAppDispatch } from '@services/hooks';
import { DND_TYPES } from '@utils/dnd';

import type { TConstructorDragItem } from '@utils/dnd';
import type { TConstructorIngredient } from '@utils/types';

import styles from './burger-constructor.module.css';

type TConstructorFillingProps = {
  index: number;
  ingredient: TConstructorIngredient;
};

export const ConstructorFilling = ({
  index,
  ingredient,
}: TConstructorFillingProps): React.JSX.Element => {
  const dispatch = useAppDispatch();

  const handleClose = useCallback((): void => {
    dispatch(removeIngredient(ingredient.uuid));
  }, [dispatch, ingredient.uuid]);

  const [{ isDragging }, dragRef] = useDrag<
    TConstructorDragItem,
    void,
    { isDragging: boolean }
  >({
    collect: (monitor): { isDragging: boolean } => ({
      isDragging: monitor.isDragging(),
    }),
    item: { index },
    type: DND_TYPES.CONSTRUCTOR_ITEM,
  });

  const [, dropRef] = useDrop<TConstructorDragItem>({
    accept: DND_TYPES.CONSTRUCTOR_ITEM,
    hover: (item): void => {
      if (item.index === index) {
        return;
      }

      dispatch(
        moveIngredient({
          fromIndex: item.index,
          toIndex: index,
        })
      );
      item.index = index;
    },
  });

  const setItemRef = (node: HTMLLIElement | null): void => {
    dragRef(node);
    dropRef(node);
  };

  return (
    <li
      className={styles.fillingItem}
      ref={setItemRef}
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <DragIcon type="primary" />
      <ConstructorElement
        extraClass={styles.element}
        handleClose={handleClose}
        price={ingredient.price}
        text={ingredient.name}
        thumbnail={ingredient.image}
      />
    </li>
  );
};
