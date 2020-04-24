import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
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

  const calculateSize = useCallback(node => {
    const size = {
      width: node.offsetWidth,
      height: node.offsetHeight,
    };

    setSize(prevSize => (isEqualToSize(prevSize, size) ? prevSize : size));
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (prevSize !== size) {
      if (size) {
        onResize(size);
      }
    }
  });

  useEffect(() => {
    if (!size) {
      calculateSize(resizeRef.current);
    }
  }, [size, calculateSize]);

  useEffect(() => {
    if (fixed) {
      return;
    }

    if (resizeDetector) {
      const resizeNode = resizeRef.current;
      resizeDetector.listenTo(resizeNode, calculateSize);

      return () => {
        resizeDetector.uninstall(resizeNode);
      };
    }
  }, [fixed, calculateSize]);

  useMemo(() => {
    let size = null;

    if (fixed) {
      size = { width, height };
    }

    setSize(prevSize => (isEqualToSize(prevSize, size) ? prevSize : size));
  }, [fixed, width, height]);

  const resizeStyle = { width: '100%', height: '100%' };

  if (isNumber(width)) {
    resizeStyle.width = width;
  }
  if (isNumber(height)) {
    resizeStyle.height = height;
  }

  if (!size) {
    return <div style={resizeStyle} ref={resizeRef}></div>;
  }

  const divStyle = {
    width: size.width,
    height: size.height,
  };
  if (divProps.style) {
    Object.assign(divStyle, divProps.style);
  }
  divProps.style = divStyle;

  let element = typeof children === 'function' ? children(size) : children;

  element = <div {...divProps}>{element}</div>;

  if (!fixed) {
    element = (
      <div style={resizeStyle} ref={resizeRef}>
        {element}
      </div>
    );
  }

  return element;
}

AutoResizing.defaultProps = defaultAutoResizingProps;

export default AutoResizing;
