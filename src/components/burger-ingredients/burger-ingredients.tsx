import { Counter, CurrencyIcon, Tab } from '@krgaa/react-developer-burger-ui-components';

import type { TIngredient } from '@utils/types';

import styles from './burger-ingredients.module.css';

type TBurgerIngredientsProps = {
  ingredients: TIngredient[];
};

const ingredientGroups = [
  { type: 'bun', label: 'Булки' },
  { type: 'sauce', label: 'Соусы' },
  { type: 'main', label: 'Начинки' },
] as const;

export const BurgerIngredients = ({
  ingredients,
}: TBurgerIngredientsProps): React.JSX.Element => {
  return (
    <section className={styles.burger_ingredients}>
      <nav>
        <ul className={styles.menu}>
          {ingredientGroups.map(({ type, label }) => (
            <Tab
              key={type}
              value={type}
              active={type === 'bun'}
              onClick={() => {
                /* TODO */
              }}
            >
              {label}
            </Tab>
          ))}
        </ul>
      </nav>

      <div className={styles.content}>
        {ingredientGroups.map(({ type, label }) => {
          const groupItems = ingredients.filter((item) => item.type === type);

          return (
            <div key={type} className={styles.group}>
              <h2 className={`${styles.title} text text_type_main-medium`}>{label}</h2>

              <ul className={styles.items}>
                {groupItems.map((ingredient) => (
                  <li key={ingredient._id} className={styles.card}>
                    <div className={styles.imageWrap}>
                      {ingredient.type === 'bun' && (
                        <Counter count={1} size="default" extraClass={styles.counter} />
                      )}
                      <img
                        src={ingredient.image}
                        alt={ingredient.name}
                        className={styles.image}
                      />
                    </div>

                    <div className={styles.price}>
                      <span className="text text_type_digits-default">
                        {ingredient.price}
                      </span>
                      <CurrencyIcon type="primary" />
                    </div>

                    <p className={`${styles.name} text text_type_main-default`}>
                      {ingredient.name}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};
