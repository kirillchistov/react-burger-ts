import {
  Button,
  ConstructorElement,
  CurrencyIcon,
} from '@krgaa/react-developer-burger-ui-components';

import type { TIngredient } from '@utils/types';

import styles from './burger-constructor.module.css';

type TBurgerConstructorProps = {
  ingredients: TIngredient[];
};

export const BurgerConstructor = ({
  ingredients,
}: TBurgerConstructorProps): React.JSX.Element => {
  // Select static ingredients for display
  const topBun = ingredients.find(
    (i) => i.type === 'bun' && i.name === 'Краторная булка N-200i'
  );
  const sauce = ingredients.find((i) => i.type === 'sauce' && i.name === 'Соус Spicy-X');
  const meat = ingredients.find(
    (i) => i.type === 'main' && i.name === 'Биокотлета из марсианской Магнолии'
  );
  const salad = ingredients.find(
    (i) => i.type === 'main' && i.name === 'Мини-салат Экзо-Плантаго'
  );
  const bottomBun = ingredients.find(
    (i) => i.type === 'bun' && i.name === 'Краторная булка N-200i'
  );

  const totalPrice =
    (topBun?.price ?? 0) +
    (sauce?.price ?? 0) +
    (meat?.price ?? 0) +
    (salad?.price ?? 0) +
    (bottomBun?.price ?? 0);

  return (
    <section className={styles.burger_constructor}>
      <div className={styles.stack}>
        {topBun && (
          <ConstructorElement
            type="top"
            text={topBun.name}
            thumbnail={topBun.image}
            price={topBun.price}
            isLocked
          />
        )}

        <div className={styles.fillings}>
          {sauce && (
            <ConstructorElement
              text={sauce.name}
              thumbnail={sauce.image}
              price={sauce.price}
            />
          )}
          {meat && (
            <ConstructorElement
              text={meat.name}
              thumbnail={meat.image}
              price={meat.price}
            />
          )}
          {salad && (
            <ConstructorElement
              text={salad.name}
              thumbnail={salad.image}
              price={salad.price}
            />
          )}
        </div>

        {bottomBun && (
          <ConstructorElement
            type="bottom"
            text={bottomBun.name}
            thumbnail={bottomBun.image}
            price={bottomBun.price}
            isLocked
            extraClass={styles.bun_bottom}
          />
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.total}>
          <span className="text text_type_digits-medium">{totalPrice}</span>
          <CurrencyIcon type="primary" />
        </div>
        <Button type="primary" size="large" htmlType="button">
          Оформить заказ
        </Button>
      </div>
    </section>
  );
};
