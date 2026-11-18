// S3.9: Универсальный кастомный хук для контроля инпутов в формах
/* Явные начальные значения для формы, принимаю любой name, setValues вместо reset */
import { useCallback, useState } from 'react';

import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

export type TFormValues = Record<string, string>;

type TUseFormResult<T extends TFormValues> = {
  values: T;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  setValues: Dispatch<SetStateAction<T>>;
};

export function useForm<T extends TFormValues>(inputValues: T): TUseFormResult<T> {
  const [values, setValues] = useState(inputValues);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }, []);

  return { values, handleChange, setValues };
}
