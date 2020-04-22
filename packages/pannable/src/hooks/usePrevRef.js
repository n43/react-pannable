import { useRef, useEffect } from 'react';

export function usePrevRef(input) {
  const ref = useRef(input);

  useEffect(() => {
    ref.current = input;
  }, [input]);

  return ref;
}
