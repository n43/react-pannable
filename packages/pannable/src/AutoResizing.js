import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from './hooks/usePrevRef';
import resizeDetector from './utils/resizeDetector';
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
  const prevSize = prevSizeRef.current;
  const resizeRef = useRef();
  const fixed = isNumber(width) && isNumber(height);
  const responseRef = useRef({});
  const methodsRef = useRef({
    calculateSize() {
      const node = resizeRef.current;
      const nextSize = {
        width: node.offsetWidth,
        height: node.offsetHeight,
      };

      setSize(size => (isEqualToSize(size, nextSize) ? size : nextSize));
    },
  });

  responseRef.current.onResize = onResize;

  useMemo(() => {
    let nextSize = null;

    if (fixed) {
      nextSize = { width, height };
    }

    setSize(size => (isEqualToSize(size, nextSize) ? size : nextSize));
  }, [fixed, width, height]);

  useIsomorphicLayoutEffect(() => {
    if (prevSize !== size) {
      if (size) {
        responseRef.current.onResize(size);
      }
    }
  }, [size]);

  useEffect(() => {
    if (fixed) {
      return;
    }

    methodsRef.current.calculateSize();

    if (resizeDetector) {
      const node = resizeRef.current;

      resizeDetector.listenTo(node, () => {
        methodsRef.current.calculateSize();
      });

      return () => {
        resizeDetector.uninstall(node);
      };
    }
  }, [fixed]);

  const divStyle = useMemo(() => {
    const style = { width: '100%', height: '100%' };

    if (isNumber(width)) {
      style.width = width;
    }
    if (isNumber(height)) {
      style.height = height;
    }

    if (divProps.style) {
      Object.assign(style, divProps.style);
    }

    return style;
  }, [width, height, divProps.style]);

  divProps.style = divStyle;

  return (
    <div {...divProps} ref={resizeRef}>
      {!size
        ? null
        : typeof children === 'function'
        ? children(size)
        : children}
    </div>
  );
}

AutoResizing.defaultProps = defaultAutoResizingProps;

export default AutoResizing;
