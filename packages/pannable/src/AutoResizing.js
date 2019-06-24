import React, { useState, useRef, useMemo, useCallback } from 'react';
import useIsomorphicLayoutEffect from './hooks/useIsomorphicLayoutEffect';
import usePrevRef from './hooks/usePrevRef';
import resizeDetector from './utils/resizeDetector';
import { getElementSize } from './utils/sizeGetter';
import { isEqualToSize } from './utils/geometry';

const defaultAutoResizingProps = {
  width: null,
  height: null,
  onResize: () => {},
};

function AutoResizing({ width, height, onResize, ...props }) {
  const [size, setSize] = useState(null);
  const prevSizeRef = usePrevRef(size);
  const resizeRef = useRef(null);

  const prevSize = prevSizeRef.current;

  const calculateSize = useCallback(() => {
    const nextSize = getElementSize(resizeRef.current);

    setSize(nextSize);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!isEqualToSize(size, prevSize)) {
      if (size) {
        onResize(size);
      } else {
        calculateSize();
      }
    }
  });

  useIsomorphicLayoutEffect(() => {
    if (typeof width === 'number' && typeof height === 'number') {
      return;
    }

    const resizeNode = resizeRef.current;

    resizeDetector.listenTo(resizeNode, () => calculateSize());

    return () => resizeDetector.uninstall(resizeNode);
  }, [width, height]);

  useMemo(() => {
    const nextSize =
      typeof width === 'number' && typeof height === 'number'
        ? { width, height }
        : null;

    setSize(nextSize);
  }, [width, height]);

  let element = props.children;

  if (size) {
    if (typeof element === 'function') {
      element = element(size);
    }
  } else {
    element = null;
  }

  props.style = {
    width: getStyleDimension(width),
    height: getStyleDimension(height),
    ...props.style,
  };

  return (
    <div {...props} ref={resizeRef}>
      {element}
    </div>
  );
}

AutoResizing.defaultProps = defaultAutoResizingProps;

function getStyleDimension(value) {
  if (value === undefined || value === null || value === '') {
    return '100%';
  }

  return value;
}

export default AutoResizing;
