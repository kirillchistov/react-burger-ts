import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useForm } from './useForm';

import type { ChangeEvent } from 'react';

const change = (name: string, value: string): ChangeEvent<HTMLInputElement> =>
  ({
    target: { name, value },
  }) as ChangeEvent<HTMLInputElement>;

describe('useForm', (): void => {
  it('хранит начальные значения', (): void => {
    const { result } = renderHook(() =>
      useForm({ email: '', name: 'Бен', password: '' })
    );

    expect(result.current.values).toEqual({
      email: '',
      name: 'Бен',
      password: '',
    });
  });

  it('меняет поле по name и не трогает остальные', (): void => {
    const { result } = renderHook(() =>
      useForm({ email: 'ben@example.com', name: 'Бен', password: '' })
    );

    act((): void => {
      result.current.handleChange(change('name', 'Кирилл'));
    });

    expect(result.current.values).toEqual({
      email: 'ben@example.com',
      name: 'Кирилл',
      password: '',
    });

    act((): void => {
      result.current.handleChange(change('password', 'secret'));
    });

    expect(result.current.values.password).toBe('secret');
    expect(result.current.values.name).toBe('Кирилл');
  });

  it('setValues подставляет данные профиля и сбрасывает пароль', (): void => {
    const { result } = renderHook(() =>
      useForm({ email: '', name: '', password: 'old' })
    );

    act((): void => {
      result.current.setValues({
        email: 'ben@example.com',
        name: 'Бен',
        password: '',
      });
    });

    expect(result.current.values).toEqual({
      email: 'ben@example.com',
      name: 'Бен',
      password: '',
    });

    act((): void => {
      result.current.handleChange(change('name', 'Кирилл'));
    });
    act((): void => {
      result.current.setValues({
        email: 'ben@example.com',
        name: 'Бен',
        password: '',
      });
    });

    expect(result.current.values.name).toBe('Бен');
    expect(result.current.values.password).toBe('');
  });
});
