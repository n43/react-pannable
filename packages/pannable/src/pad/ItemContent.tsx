import PadContext from './PadContext';
import { Size } from '../interfaces';
import { useIsomorphicLayoutEffect, usePrevious } from '../utils/hooks';
import { isEqualToSize, isNumber } from '../utils/geometry';
import { getResizeDetector } from '../utils/resizeDetector';
import React, { useState, useMemo, useRef, useContext, useEffect } from 'react';

function contentOnResize() {}

const wrapperStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
};

export interface ItemContentProps {
  width?: number | null;
  height?: number | null;
  autoResizing?: boolean;
}

const defaultItemContentProps = {
  width: null,
  height: null,
  autoResizing: false,
};

const ItemContent: React.FC<ItemContentProps &
  React.HTMLAttributes<HTMLDivElement>> = React.memo(props => {
  const {
    width,
    height,
    autoResizing,
    children,
    ...divProps
  } = props as Required<ItemContentProps> &
    React.HTMLAttributes<HTMLDivElement>;
  const context = useContext(PadContext);

  const fixedWidth = isNumber(width)
    ? width
    : !autoResizing
    ? context.width
    : null;
  const fixedHeight = isNumber(height)
    ? height
    : !autoResizing
    ? context.height
    : null;
  const fixedSize = useMemo(() => {
    if (!isNumber(width) || !isNumber(height)) {
      return null;
    }

    return { width, height } as Size;
  }, [width, height]);

  const [size, setSize] = useState<Size | null>(null);
  const prevSize = usePrevious(size);
  const resizeRef = useRef<HTMLDivElement>(null);
  const delegate = { onResize: context.onResize };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  useIsomorphicLayoutEffect(() => {
    if (prevSize !== size) {
      if (size) {
        delegateRef.current.onResize(size);
      }
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

      const nextSize: Size = {
        width: node.offsetWidth,
        height: node.offsetHeight,
      };

      setSize(size => (isEqualToSize(size, nextSize) ? size : nextSize));
    }

    calculateSize();

    if (autoResizing) {
      const detector = getResizeDetector();
      const node = resizeRef.current;

      if (detector && node) {
        detector.listenTo(node, calculateSize);

        return () => {
          detector.uninstall(node);
        };
      }
    }

    return;
  }, [fixedSize, autoResizing]);

  useMemo(() => {
    if (fixedSize) {
      setSize(size => (isEqualToSize(size, fixedSize) ? size : fixedSize));
    }
  }, [fixedSize]);

  const resizeStyle = useMemo(() => {
    const style: React.CSSProperties = { position: 'absolute' };

    if (isNumber(fixedWidth)) {
      style.width = fixedWidth as number;
    }
    if (isNumber(fixedHeight)) {
      style.height = fixedHeight as number;
    }

    return style;
  }, [fixedWidth, fixedHeight]);

  let element = typeof children === 'function' ? children(size) : children;

  if (!fixedSize) {
    element = (
      <div style={wrapperStyle}>
        <div style={resizeStyle} ref={resizeRef}>
          {element}
        </div>
      </div>
    );
  }

  const divStyle = useMemo(() => {
    const style: React.CSSProperties = { position: 'relative' };

    if (size) {
      style.width = size.width;
      style.height = size.height;
    }
    if (divProps.style) {
      Object.assign(style, divProps.style);
    }

    return style;
  }, [size, divProps.style]);

  divProps.style = divStyle;

  return (
    <div {...divProps}>
      <PadContext.Provider
        value={{
          ...context,
          width: null,
          height: null,
          onResize: contentOnResize,
        }}
      >
        {element}
      </PadContext.Provider>
    </div>
  );
});

ItemContent.defaultProps = defaultItemContentProps;

export default ItemContent;
