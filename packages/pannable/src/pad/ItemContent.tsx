import PadContext from './PadContext';
import { Size } from '../interfaces';
import { useIsomorphicLayoutEffect } from '../utils/hooks';
import { isEqualToSize } from '../utils/geometry';
import { getResizeDetector } from '../utils/resizeDetector';
import React, {
  useState,
  useMemo,
  useRef,
  useContext,
  useCallback,
} from 'react';

function contentOnResize() {}

const wrapperStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
};

export interface ItemContentProps {
  width?: number;
  height?: number;
  autoResizing?: boolean;
  render?: () => React.ReactNode;
}

export const ItemContent = React.memo<
  React.ComponentProps<'div'> & ItemContentProps
>((props) => {
  const {
    width,
    height,
    autoResizing = false,
    render,
    children,
    ...divProps
  } = props;
  const context = useContext(PadContext);

  const fixedWidth = width ?? context.width;
  const fixedHeight = height ?? context.height;
  const fixedSize = useMemo(() => {
    if (fixedWidth !== undefined && fixedHeight !== undefined) {
      return { width: fixedWidth, height: fixedHeight };
    }
    return null;
  }, [fixedWidth, fixedHeight]);

  const [size, setSize] = useState<Size | null>(null);
  const prevSizeRef = useRef(size);
  const resizeRef = useRef<HTMLDivElement>(null);
  const delegate = { onResize: context.onResize };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  const calculateSize = useCallback(() => {
    const node = resizeRef.current;

    if (!node) {
      return;
    }

    const nextSize: Size = {
      width: node.offsetWidth,
      height: node.offsetHeight,
    };

    setSize((size) => (isEqualToSize(size, nextSize) ? size : nextSize));
  }, []);

  useIsomorphicLayoutEffect(() => {
    const prevSize = prevSizeRef.current;
    prevSizeRef.current = size;

    if (size && !isEqualToSize(prevSize, size)) {
      delegateRef.current.onResize(size);
    }
  }, [size]);

  useIsomorphicLayoutEffect(() => {
    if (fixedSize) {
      setSize((size) => (isEqualToSize(size, fixedSize) ? size : fixedSize));
      return;
    }

    calculateSize();

    if (!autoResizing) {
      return;
    }

    const detector = getResizeDetector();
    const node = resizeRef.current;

    if (!detector || !node) {
      return;
    }

    detector.listenTo(node, calculateSize);

    return () => {
      detector.uninstall(node);
    };
  }, [fixedSize, autoResizing, calculateSize]);

  const resizeStyle = useMemo(() => {
    const style: React.CSSProperties = { position: 'absolute' };

    if (fixedWidth !== undefined) {
      style.width = fixedWidth;
    }
    if (fixedHeight !== undefined) {
      style.height = fixedHeight;
    }

    return style;
  }, [fixedWidth, fixedHeight]);

  let elem = children;

  if (render) {
    elem = render();
  }

  if (!fixedSize) {
    elem = (
      <div style={wrapperStyle}>
        <div style={resizeStyle} ref={resizeRef}>
          {elem}
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
          width: fixedWidth,
          height: fixedHeight,
          onResize: contentOnResize,
        }}
      >
        {elem}
      </PadContext.Provider>
    </div>
  );
});

export default ItemContent;
