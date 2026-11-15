import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

// Node 25+ вешает на globalThis экспериментальный localStorage без .clear
// (warning `--localstorage-file`). jsdom его не подменяет — тесты падают.
class MemoryStorage implements Storage {
  #map = new Map<string, string>();

  get length(): number {
    return this.#map.size;
  }

  clear(): void {
    this.#map.clear();
  }

  getItem(key: string): string | null {
    return this.#map.has(key) ? this.#map.get(key)! : null;
  }

  key(index: number): string | null {
    return [...this.#map.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.#map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.#map.set(String(key), String(value));
  }
}

const memoryStorage = new MemoryStorage();

const installLocalStorage = (target: object): void => {
  try {
    Object.defineProperty(target, 'localStorage', {
      configurable: true,
      enumerable: true,
      value: memoryStorage,
      writable: true,
    });
  } catch {
    try {
      (target as { localStorage: Storage }).localStorage = memoryStorage;
    } catch {
      // Non-configurable native localStorage: beforeEach ниже перекроет через stubGlobal.
    }
  }
};

installLocalStorage(globalThis);

if (typeof window !== 'undefined') {
  installLocalStorage(window);
}

beforeEach((): void => {
  installLocalStorage(globalThis);

  if (typeof window !== 'undefined') {
    installLocalStorage(window);
  }

  vi.stubGlobal('localStorage', memoryStorage);
  memoryStorage.clear();
});
