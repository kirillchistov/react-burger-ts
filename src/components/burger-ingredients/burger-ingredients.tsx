import { Tab } from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useMemo, useRef, useState } from 'react';

import { IngredientItem } from '@components/ingredient-item/ingredient-item';

import type { TIngredient } from '@utils/types';

import styles from './burger-ingredients.module.css';

type TIngredientGroupType = 'bun' | 'main' | 'sauce';

type TBurgerIngredientsProps = {
  counts: Record<string, number>;
  ingredients: TIngredient[];
};

const ingredientGroups: readonly { label: string; type: TIngredientGroupType }[] = [
  { type: 'bun', label: 'Булки' },
  { type: 'sauce', label: 'Соусы' },
  { type: 'main', label: 'Начинки' },
];

export const BurgerIngredients = ({
  counts,
  ingredients,
}: TBurgerIngredientsProps): React.JSX.Element => {
  const [currentTab, setCurrentTab] = useState<TIngredientGroupType>('bun');
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Partial<Record<TIngredientGroupType, HTMLElement | null>>>(
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
    const nextTab = value as TIngredientGroupType;
    const container = contentRef.current;
    const section = sectionRefs.current[nextTab];

    setCurrentTab(nextTab);

    if (!container || !section) {
      return;
    }

    const top =
      section.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;

    container.scrollTo({ behavior: 'smooth', top });
  }, []);

  const handleScroll = useCallback((): void => {
    const container = contentRef.current;

    if (!container) {
      return;
    }

    const containerTop = container.getBoundingClientRect().top;

    const nextTab = ingredientGroups.reduce<TIngredientGroupType>((closest, group) => {
      const section = sectionRefs.current[group.type];

      if (!section) {
        return closest;
      }

      const closestSection = sectionRefs.current[closest];
      const distance = Math.abs(section.getBoundingClientRect().top - containerTop);
      const closestDistance = closestSection
        ? Math.abs(closestSection.getBoundingClientRect().top - containerTop)
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
          <section
            key={type}
            className={styles.group}
            ref={(element) => {
              sectionRefs.current[type] = element;
            }}
          >
            <h2 className={`${styles.title} text text_type_main-medium`}>{label}</h2>
            <ul className={styles.items}>
              {items.map((ingredient) => (
                <IngredientItem
                  key={ingredient._id}
                  count={counts[ingredient._id]}
                  ingredient={ingredient}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
};
