/* Ингредиенты и счётчики брать в Redux, а не из props. */
import { Tab } from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useMemo, useRef, useState } from 'react';

import { IngredientItem } from '@components/ingredient-item/ingredient-item';
import { selectIngredientCounts } from '@services/burger-constructor/burger-constructor-slice';
import { useAppSelector } from '@services/hooks';
import { selectIngredients } from '@services/ingredients/ingredients-slice';

import type { TIngredient, TIngredientType } from '@utils/types';

import styles from './burger-ingredients.module.css';

type TBurgerIngredientsProps = {
  onIngredientClick: (ingredient: TIngredient) => void;
};

const ingredientGroups: readonly { label: string; type: TIngredientType }[] = [
  { type: 'bun', label: 'Булки' },
  { type: 'sauce', label: 'Соусы' },
  { type: 'main', label: 'Начинки' },
];

const isIngredientType = (value: string): value is TIngredientType =>
  value === 'bun' || value === 'sauce' || value === 'main';

export const BurgerIngredients = ({
  onIngredientClick,
}: TBurgerIngredientsProps): React.JSX.Element => {
  const ingredients = useAppSelector(selectIngredients);
  const counts = useAppSelector(selectIngredientCounts);
  const [currentTab, setCurrentTab] = useState<TIngredientType>('bun');
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<Partial<Record<TIngredientType, HTMLHeadingElement | null>>>(
    {}
  );

  const groupedIngredients = useMemo(
    () =>
      ingredientGroups.map((group) => ({
        ...group,
        items: ingredients.filter((item) => item.type === group.type),
      })),
    [ingredients]
  );

  const handleTabClick = useCallback((value: string): void => {
    if (!isIngredientType(value)) {
      return;
    }

    const container = contentRef.current;
    const title = titleRefs.current[value];

    setCurrentTab(value);

    if (!container || !title) {
      return;
    }

    const top =
      title.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;

    container.scrollTo({ behavior: 'smooth', top });
  }, []);

  const handleScroll = useCallback((): void => {
    const container = contentRef.current;

    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();

    const nextTab = ingredientGroups.reduce<TIngredientType>((closest, group) => {
      const title = titleRefs.current[group.type];

      if (!title) {
        return closest;
      }

      const closestTitle = titleRefs.current[closest];
      const distance = Math.abs(title.getBoundingClientRect().top - containerRect.top);
      const closestDistance = closestTitle
        ? Math.abs(closestTitle.getBoundingClientRect().top - containerRect.top)
        : Number.POSITIVE_INFINITY;

      return distance < closestDistance ? group.type : closest;
    }, 'bun');

    setCurrentTab(nextTab);
  }, []);

  return (
    <section className={styles.burgerIngredients}>
      <h1 className="text text_type_main-large mt-10 mb-5">Соберите бургер</h1>
      <nav>
        <div className={styles.menu}>
          {ingredientGroups.map(({ type, label }) => (
            <Tab
              key={type}
              active={currentTab === type}
              onClick={handleTabClick}
              value={type}
            >
              {label}
            </Tab>
          ))}
        </div>
      </nav>
      <div
        className={`${styles.content} custom-scroll`}
        onScroll={handleScroll}
        ref={contentRef}
      >
        {groupedIngredients.map(({ type, label, items }) => (
          <section key={type} className={styles.group}>
            <h2
              className={`${styles.title} text text_type_main-medium`}
              ref={(element) => {
                titleRefs.current[type] = element;
              }}
            >
              {label}
            </h2>
            <ul className={styles.items}>
              {items.map((ingredient) => (
                <IngredientItem
                  key={ingredient._id}
                  count={counts[ingredient._id]}
                  ingredient={ingredient}
                  onClick={onIngredientClick}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
};
