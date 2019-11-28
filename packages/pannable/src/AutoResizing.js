import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from './hooks/usePrevRef';
import resizeDetector from './utils/resizeDetector';
import { getElementSize } from './utils/sizeGetter';
import { isEqualToSize } from './utils/geometry';

const defaultAutoResizingProps = {
  width: null,
  height: null,
  onResize: () => {},
};

function AutoResizing(props) {
  const { width, height, onResize, children, ...divProps } = props;
  const [size, setSize] = useState(null);
  const prevSizeRef = usePrevRef(size);
  const resizeRef = useRef(null);

  const prevSize = prevSizeRef.current;

  const calculateSize = useCallback(() => {
    const nextSize = getElementSize(resizeRef.current);

    setSize(nextSize);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!isEqualToSize(prevSize, size)) {
      if (size) {
        onResize(size);
      }
    }

    if (!size) {
      calculateSize();
    }
  });

  useIsomorphicLayoutEffect(() => {
    if (typeof width === 'number' && typeof height === 'number') {
      return;
    }

    if (resizeDetector) {
      const resizeNode = resizeRef.current;
      resizeDetector.listenTo(resizeNode, () => calculateSize());

      return () => resizeDetector.uninstall(resizeNode);
    }
  }, [width, height]);

  useMemo(() => {
    let nextSize = null;

    if (typeof width === 'number' && typeof height === 'number') {
      nextSize = { width, height };
    }

    setSize(nextSize);
  }, [width, height]);

  divProps.style = {
    width: getStyleDimension(width),
    height: getStyleDimension(height),
    ...divProps.style,
  };

  let element = null;

  if (size) {
    element = typeof children === 'function' ? children(size) : children;
  }

  return (
    <div {...divProps} ref={resizeRef}>
      {element}
    </div>
  );
}

AutoResizing.defaultProps = defaultAutoResizingProps;

export default AutoResizing;

function getStyleDimension(value) {
  if (value === undefined || value === null || value === '') {
    return '100%';
  }

  return value;
}
