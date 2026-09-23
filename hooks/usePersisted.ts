import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

/** State loaded once from storage and written back on every change after that. */
export function usePersisted<T>(
  initial: T,
  load: () => Promise<T>,
  save: (value: T) => Promise<void>,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    load().then((v) => {
      setValue(v);
      setLoaded(true);
    });
    // Load exactly once; `load` is a module-level function.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loaded) save(value);
  }, [value, loaded, save]);

  return [value, setValue, loaded];
}
