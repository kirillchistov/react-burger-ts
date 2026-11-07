import { afterEach, describe, expect, it } from 'vitest';

import { ACCESS_TOKEN_KEY } from '@utils/constants';

import { getWsAccessToken } from './auth';

describe('getWsAccessToken', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('отдаёт токен без префикса Bearer', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'Bearer secret-token');

    expect(getWsAccessToken()).toBe('secret-token');
  });

  it('возвращает null, если токена нет', () => {
    expect(getWsAccessToken()).toBeNull();
  });
});
