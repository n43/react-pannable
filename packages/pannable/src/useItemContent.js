import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

export const defaultItemContentProps = {
  width: null,
  height: null,
};

export function useItemContent({
  width = defaultItemContentProps.width,
  height = defaultItemContentProps.height,
  ...props
}) {
  const size = useMemo(() => {
    return typeof width !== 'number' || typeof height !== 'number'
      ? null
      : { width, height };
  }, [width, height]);
}
