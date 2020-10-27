import {
  useRef,
  useEffect,
  useLayoutEffect,
  EffectCallback,
  DependencyList,
} from 'react';

export function useIsomorphicLayoutEffect(
  effect: EffectCallback,
  deps?: DependencyList
) {
  if (typeof window === 'undefined') {
    useEffect(effect, deps);
    return;
  }

  useLayoutEffect(effect, deps);
}

export function usePrevious<T = any>(input: T) {
  const ref = useRef(input);

  useEffect(() => {
    ref.current = input;
  }, [input]);

  return ref.current;
}
