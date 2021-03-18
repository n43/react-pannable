import { Size } from './interfaces';
import { useIsomorphicLayoutEffect } from './utils/hooks';
import { getResizeDetector } from './utils/resizeDetector';
import { isEqualToSize, isNumber } from './utils/geometry';
import React, { useState, useRef, useMemo, useEffect } from 'react';

export interface AutoResizingProps {
  width?: number | null;
  height?: number | null;
  onResize?: (size: Size) => void;
}

const defaultAutoResizingProps: AutoResizingProps = {
  width: null,
  height: null,
  onResize: () => {},
};

const AutoResizing: React.FC<
  AutoResizingProps & React.ComponentProps<'div'>
> = React.memo((props) => {
  const { width, height, onResize, children, ...divProps } = props as Required<
    AutoResizingProps
  > &
    React.ComponentProps<'div'>;
  const [size, setSize] = useState<Size | null>(null);
  const fixedSize = useMemo(() => {
    if (!isNumber(width) || !isNumber(height)) {
      return null;
    }

    return { width, height } as Size;
  }, [width, height]);
  const resizeRef = useRef<HTMLDivElement>(null);
  const delegate = { onResize };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  useIsomorphicLayoutEffect(() => {
    if (size) {
      delegateRef.current.onResize(size);
    }
  }, [size]);

  useEffect(() => {
    if (fixedSize) {
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

      setSize((size) => (isEqualToSize(size, nextSize) ? size : nextSize));
    }

    calculateSize();

    const detector = getResizeDetector();
    const node = resizeRef.current;

    if (detector && node) {
      detector.listenTo(node, calculateSize);

      return () => {
        detector.uninstall(node);
      };
    }

    return;
  }, [fixedSize]);

  useMemo(() => {
    if (fixedSize) {
      setSize((size) => (isEqualToSize(size, fixedSize) ? size : fixedSize));
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

  let element: React.ReactNode = null;

  if (size) {
    element = typeof children === 'function' ? children(size) : children;
  }

  return (
    <div {...divProps} ref={resizeRef}>
      {element}
    </div>
  );
});

AutoResizing.defaultProps = defaultAutoResizingProps;

export default AutoResizing;
