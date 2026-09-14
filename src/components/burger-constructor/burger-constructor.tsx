/* Булка и начинки читаются из Redux, массив ингредиентов в props не передаётся. */
import {
  Button,
  ConstructorElement,
  CurrencyIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useDrop } from 'react-dnd';

import { ConstructorFilling } from '@components/burger-constructor/constructor-filling';
import { ConstructorPlaceholder } from '@components/burger-constructor/constructor-placeholder';
import {
  addIngredient,
  selectConstructorBun,
  selectConstructorIngredients,
  selectConstructorTotalPrice,
} from '@services/burger-constructor/burger-constructor-slice';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import { DND_TYPES } from '@utils/dnd';

import type { TIngredient } from '@utils/types';

import styles from './burger-constructor.module.css';

type TBurgerConstructorProps = {
  onOrderClick: () => void;
};

type TConstructorDropCollected = {
  draggedType: string | symbol | null;
  isOver: boolean;
};

export const BurgerConstructor = ({
  onOrderClick,
}: TBurgerConstructorProps): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const bun = useAppSelector(selectConstructorBun);
  const fillings = useAppSelector(selectConstructorIngredients);
  const totalPrice = useAppSelector(selectConstructorTotalPrice);

  const [{ draggedType, isOver }, dropRef] = useDrop<
    TIngredient,
    void,
    TConstructorDropCollected
  >({
    accept: [DND_TYPES.BUN, DND_TYPES.FILLING],
    collect: (monitor): TConstructorDropCollected => ({
      draggedType: monitor.getItemType(),
      isOver: monitor.isOver(),
    }),
    drop: (item): void => {
      dispatch(addIngredient(item));
    },
  });

  const isBunActive = draggedType === DND_TYPES.BUN;
  const isFillingActive = draggedType === DND_TYPES.FILLING;
  const isBunHovered = isOver && isBunActive;
  const isFillingHovered = isOver && isFillingActive;

  const setDropRef = (node: HTMLDivElement | null): void => {
    dropRef(node);
  };

  return (
    <section className={styles.burgerConstructor}>
      <div className={styles.stack} ref={setDropRef}>
        {bun ? (
          <div className={styles.bun}>
            <ConstructorElement
              extraClass={styles.element}
              isLocked
              price={bun.price}
              text={`${bun.name} (верх)`}
              thumbnail={bun.image}
              type="top"
            />
          </div>
        ) : (
          <div className={styles.bun}>
            <ConstructorPlaceholder
              isActive={isBunActive}
              isHovered={isBunHovered}
              text="Выберите булки"
              type="top"
            />
          </div>
        )}
        {fillings.length > 0 ? (
          <ul className={`${styles.fillings} custom-scroll`}>
            {fillings.map((ingredient, index) => (
              <ConstructorFilling
                key={ingredient.uuid}
                index={index}
                ingredient={ingredient}
              />
            ))}
          </ul>
        ) : (
          <div className={`${styles.fillings} ${styles.fillingsEmpty}`}>
            <ConstructorPlaceholder
              isActive={isFillingActive}
              isHovered={isFillingHovered}
              isTall
              text="Выберите начинку"
            />
          </div>
        )}
        {bun ? (
          <div className={styles.bun}>
            <ConstructorElement
              extraClass={`${styles.element} ${styles.bunBottom}`}
              isLocked
              price={bun.price}
              text={`${bun.name} (низ)`}
              thumbnail={bun.image}
              type="bottom"
            />
          </div>
        ) : (
          <div className={styles.bun}>
            <ConstructorPlaceholder
              isActive={isBunActive}
              isHovered={isBunHovered}
              text="Выберите булки"
              type="bottom"
            />
          </div>
        )}
      </div>
      <div className={styles.footer}>
        <div className={styles.total}>
          <span className="text text_type_digits-medium">{totalPrice}</span>
          <CurrencyIcon type="primary" />
        </div>
        <Button
          disabled={!bun}
          htmlType="button"
          onClick={onOrderClick}
          size="large"
          type="primary"
        >
          Оформить заказ
        </Button>
      </div>
    </section>
  );
};
