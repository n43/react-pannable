import { Size } from './interfaces';
import { getResizeDetector } from './utils/resizeDetector';
import { isEqualToSize } from './utils/geometry';
import { useIsomorphicLayoutEffect } from './utils/hooks';
import React, { useState, useRef, useMemo, useCallback } from 'react';

export interface AutoResizingProps {
  width?: number;
  height?: number;
  onResize?: (size: Size) => void;
  render?: (size: Size) => React.ReactNode;
}

export const AutoResizing = React.memo(
  (props: React.ComponentProps<'div'> & AutoResizingProps) => {
    const { width, height, onResize, render, children, ...divProps } = props;

    const fixedSize = useMemo(() => {
      if (width !== undefined && height !== undefined) {
        return { width, height };
      }
      return null;
    }, [width, height]);

    const [size, setSize] = useState<Size>();
    const prevSizeRef = useRef(size);
    const resizeRef = useRef<HTMLDivElement>(null);
    const delegate = { onResize };
    const delegateRef = useRef(delegate);
    delegateRef.current = delegate;

    const calculateSize = useCallback(() => {
      const node = resizeRef.current;

      if (!node) {
        return;
      }

      const nextSize = {
        width: node.offsetWidth,
        height: node.offsetHeight,
      };

      setSize((size) => (isEqualToSize(size, nextSize) ? size : nextSize));
    }, []);

    useIsomorphicLayoutEffect(() => {
      const prevSize = prevSizeRef.current;
      prevSizeRef.current = size;

      if (size && !isEqualToSize(prevSize, size)) {
        if (delegateRef.current.onResize) {
          delegateRef.current.onResize(size);
        }
      }
    }, [size]);

    useIsomorphicLayoutEffect(() => {
      if (fixedSize) {
        setSize((size) => (isEqualToSize(size, fixedSize) ? size : fixedSize));
        return;
      }

      calculateSize();

      const detector = getResizeDetector();
      const node = resizeRef.current;

      if (!detector || !node) {
        return;
      }

      detector.listenTo(node, calculateSize);

      return () => {
        detector.uninstall(node);
      };
    }, [fixedSize, calculateSize]);

    const divStyle = useMemo(() => {
      const style: React.CSSProperties = { width: '100%', height: '100%' };

      if (width !== undefined) {
        style.width = width;
      }
      if (height !== undefined) {
        style.height = height;
      }

      if (divProps.style) {
        Object.assign(style, divProps.style);
      }

      return style;
    }, [width, height, divProps.style]);

    divProps.style = divStyle;

    let elem = children;

    if (size) {
      if (render) {
        elem = render(size);
      }
    } else {
      elem = null;
    }

    return (
      <div {...divProps} ref={resizeRef}>
        {elem}
      </div>
    );
  }
);

export default AutoResizing;
