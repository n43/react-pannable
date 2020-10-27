import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useIsomorphicLayoutEffect } from './utils/hooks';
import { getResizeDetector } from './utils/resizeDetector';
import { isEqualToSize, isNumber, Size } from './utils/geometry';

export type AutoResizingProps = React.HTMLAttributes<HTMLDivElement> & {
  width: number | null;
  height: number | null;
  onResize: (size: Size) => void;
  children?: (size: Size) => React.ReactNode;
};

const defaultAutoResizingProps: AutoResizingProps = {
  width: null,
  height: null,
  onResize: () => {},
};

const AutoResizing: React.VFC<AutoResizingProps> = props => {
  const { width, height, onResize, children, ...divProps } = props;
  const [size, setSize] = useState<Size | null>(null);
  const fixedSize = useMemo(() => {
    if (isNumber(width) && isNumber(height)) {
      return {
        width: width as number,
        height: height as number,
      };
    }

    return null;
  }, [width, height]);
  const resizeRef = useRef<React.ElementRef<'div'>>(null);
  const propsRef = useRef(props);

  propsRef.current = props;

  useIsomorphicLayoutEffect(() => {
    if (size) {
      propsRef.current.onResize(size);
    }
  }, [size]);

  useEffect(() => {
    if (fixedSize) {
      return;
    }

    const detector = getResizeDetector();
    const node = resizeRef.current;

    if (!detector || !node) {
      return;
    }

    function calculateSize() {
      const node = resizeRef.current;

      if (!node) {
        return;
      }

      const nextSize = {
        width: node.offsetWidth,
        height: node.offsetHeight,
      };

      setSize(size => (isEqualToSize(size, nextSize) ? size : nextSize));
    }

    calculateSize();

    detector.listenTo(node, calculateSize);

    return () => {
      detector.uninstall(node);
    };
  }, [fixedSize]);

  useMemo(() => {
    if (fixedSize) {
      setSize(size => (isEqualToSize(size, fixedSize) ? size : fixedSize));
    }
  }, [fixedSize]);

  const divStyle = useMemo(() => {
    const style: React.CSSProperties = { width: '100%', height: '100%' };

    if (isNumber(width)) {
      style.width = width as number;
    }
    if (isNumber(height)) {
      style.height = height as number;
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
};

AutoResizing.defaultProps = defaultAutoResizingProps;

export default AutoResizing;
