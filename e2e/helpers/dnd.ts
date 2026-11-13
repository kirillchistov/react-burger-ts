import type { Locator } from '@playwright/test';

export const dragHtml5 = async (source: Locator, target: Locator): Promise<void> => {
  const sourceHandle = await source.elementHandle();
  const targetHandle = await target.elementHandle();

  if (!sourceHandle || !targetHandle) {
    throw new Error('Не найдены элементы для перетаскивания');
  }

  await sourceHandle.evaluate((from, to): void => {
    const dataTransfer = new DataTransfer();
    dataTransfer.effectAllowed = 'move';

    const fire = (node: EventTarget, type: string): boolean =>
      node.dispatchEvent(
        new DragEvent(type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          dataTransfer,
        })
      );

    fire(from, 'pointerdown');
    fire(from, 'dragstart');
    fire(to, 'dragenter');
    fire(to, 'dragover');
    fire(to, 'drop');
    fire(from, 'dragend');
  }, targetHandle);
};
