export const DND_TYPES = {
  BUN: 'bun',
  CONSTRUCTOR_ITEM: 'constructorItem',
  FILLING: 'filling',
} as const;

export type TConstructorDragItem = {
  index: number;
};
