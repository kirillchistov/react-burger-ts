import {
  Button,
  ConstructorElement,
  CurrencyIcon,
  DragIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useMemo } from 'react';

import type { TIngredient } from '@utils/types';

import styles from './burger-constructor.module.css';

type TBurgerConstructorProps = {
  bun: TIngredient | null;
  fillings: TIngredient[];
};

export const BurgerConstructor = ({
  bun,
  fillings,
}: TBurgerConstructorProps): React.JSX.Element => {
  const totalPrice = useMemo(
    () =>
      (bun?.price ?? 0) * 2 +
      fillings.reduce((sum, ingredient) => sum + ingredient.price, 0),
    [bun, fillings]
  );

  return (
    <section className={styles.burgerConstructor}>
      <div className={styles.stack}>
        {bun && (
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
        )}
        <ul className={`${styles.fillings} custom-scroll`}>
          {fillings.map((ingredient, index) => (
            <li
              key={`${ingredient._id}-${String(index)}`}
              className={styles.fillingItem}
            >
              <DragIcon type="primary" />
              <ConstructorElement
                extraClass={styles.element}
                price={ingredient.price}
                text={ingredient.name}
                thumbnail={ingredient.image}
              />
            </li>
          ))}
        </ul>
        {bun && (
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
        )}
      </div>
      <div className={styles.footer}>
        <div className={styles.total}>
          <span className="text text_type_digits-medium">{totalPrice}</span>
          <CurrencyIcon type="primary" />
        </div>
        <Button htmlType="button" size="large" type="primary">
          Оформить заказ
        </Button>
      </div>
    </section>
  );
};
