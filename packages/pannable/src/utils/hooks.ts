import { useRef, useEffect, useLayoutEffect } from 'react';

export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function usePrevious<T = any>(input: T) {
  const ref = useRef(input);

  useEffect(() => {
    ref.current = input;
  }, [input]);

  return ref.current;
}
