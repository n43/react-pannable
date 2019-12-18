import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from './hooks/usePrevRef';
import resizeDetector from './utils/resizeDetector';
import { getElementSize } from './utils/sizeGetter';
import { isEqualToSize, isNumber } from './utils/geometry';

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
    const size = getElementSize(resizeRef.current);

    setSize(prevSize => (isEqualToSize(prevSize, size) ? prevSize : size));
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (prevSize !== size) {
      if (size) {
        onResize(size);
      }
    }

    if (!size) {
      calculateSize();
    }
  });

  useIsomorphicLayoutEffect(() => {
    if (isNumber(width) && isNumber(height)) {
      return;
    }

    if (resizeDetector) {
      const resizeNode = resizeRef.current;
      resizeDetector.listenTo(resizeNode, () => calculateSize());

      return () => resizeDetector.uninstall(resizeNode);
    }
  }, [width, height]);

  useMemo(() => {
    let size = null;

    if (isNumber(width) && isNumber(height)) {
      size = { width, height };
    }

    setSize(prevSize => (isEqualToSize(prevSize, size) ? prevSize : size));
  }, [width, height]);

  let element = null;

  if (size) {
    element = typeof children === 'function' ? children(size) : children;
  }

  const elemStyle = {
    width: isNumber(width) ? width : '100%',
    height: isNumber(height) ? height : '100%',
  };

  if (divProps.style) {
    Object.assign(elemStyle, divProps.style);
  }
  divProps.style = elemStyle;

  return (
    <div {...divProps} ref={resizeRef}>
      {element}
    </div>
  );
}

AutoResizing.defaultProps = defaultAutoResizingProps;

export default AutoResizing;
