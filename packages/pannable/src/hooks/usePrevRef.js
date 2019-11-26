import { useRef, useEffect } from 'react';

export function usePrevRef(current) {
  const ref = useRef(current);

  useEffect(() => {
    ref.current = current;
  });

  return ref;
}
