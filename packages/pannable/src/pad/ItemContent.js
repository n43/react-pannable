import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useContext,
} from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import { getElementSize } from '../utils/sizeGetter';
import { isEqualToSize } from '../utils/geometry';
import PadContext from './PadContext';

const defaultItemContentProps = {
  width: null,
  height: null,
};

function ItemContent(props) {
  const { width, height, children, ...divProps } = props;
  const [size, setSize] = useState(null);
  const prevSizeRef = usePrevRef(size);
  const context = useContext(PadContext);
  const resizeRef = useRef(null);

  const prevSize = prevSizeRef.current;

  const resizeContent = useCallback(() => {}, []);
  const getResizeNode = useCallback(() => resizeRef.current, []);
  const calculateSize = useCallback(() => {
    const nextSize = getElementSize(resizeRef.current);

    setSize(nextSize);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!isEqualToSize(prevSize, size)) {
      if (size) {
        context.resizeContent(size);
      }
    }

    if (!size) {
      calculateSize();
    }
  });

  useMemo(() => {
    let nextSize = null;

    if (typeof width === 'number' && typeof height === 'number') {
      nextSize = { width, height };
    }

    setSize(nextSize);
  }, [width, height]);

  const elemStyle = { position: 'relative' };
  const resizeStyle = { position: 'absolute' };

  if (typeof width === 'number') {
    resizeStyle.width = width;
  }
  if (typeof height === 'number') {
    resizeStyle.height = height;
  }
  if (size) {
    elemStyle.width = size.width;
    elemStyle.height = size.height;
  }

  if (divProps.style) {
    Object.assign(elemStyle, divProps.style);
  }
  divProps.style = elemStyle;

  const element =
    typeof children === 'function'
      ? children(size, { getResizeNode, calculateSize })
      : children;

  return (
    <PadContext.Provider value={{ ...context, resizeContent }}>
      <div {...divProps}>
        <div ref={resizeRef} style={resizeStyle}>
          {element}
        </div>
      </div>
    </PadContext.Provider>
  );
}

ItemContent.defaultProps = defaultItemContentProps;
ItemContent.PadContent = true;

export default ItemContent;
