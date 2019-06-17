import React, { useState, useRef, useCallback } from 'react';
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

function AutoResizing({
  width = defaultAutoResizingProps.width,
  height = defaultAutoResizingProps.height,
  onResize = defaultAutoResizingProps.onResize,
  ...props
}) {
  const [size, setSize] = useState(null);
  const prevSizeRef = usePrevRef(size);
  const propsRef = useRef(defaultAutoResizingProps);
  const resizeRef = useRef(null);

  const prevProps = propsRef.current;
  propsRef.current = { width, height, onResize };

  const calculateSize = useCallback(() => {
    const nextSize = getElementSize(resizeRef.current);

    setSize(prevSize =>
      isEqualToSize(nextSize, prevSize) ? prevSize : nextSize
    );
  }, []);

  useIsomorphicLayoutEffect(() => {
    const prevSize = prevSizeRef.current;

    if (size !== prevSize) {
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

  if (width !== prevProps.width || height !== prevProps.height) {
    const nextSize =
      typeof width === 'number' && typeof height === 'number'
        ? { width, height }
        : null;

    setSize(prevSize =>
      isEqualToSize(nextSize, prevSize) ? prevSize : nextSize
    );
  }

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
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && value) {
    return value;
  }

  return '100%';
}

export default AutoResizing;
