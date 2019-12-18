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
import { isEqualToSize, isNumber } from '../utils/geometry';
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
    const size = getElementSize(resizeRef.current);

    setSize(prevSize => (isEqualToSize(prevSize, size) ? prevSize : size));
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (prevSize !== size) {
      if (size) {
        context.resizeContent(size);
      }
    }

    if (!size) {
      calculateSize();
    }
  });

  useMemo(() => {
    let size = null;

    if (isNumber(width) && isNumber(height)) {
      size = { width, height };
    }

    setSize(prevSize => (isEqualToSize(prevSize, size) ? prevSize : size));
  }, [width, height]);

  let element =
    typeof children === 'function'
      ? children(size, { getResizeNode, calculateSize })
      : children;

  const elemStyle = { position: 'relative' };
  const resizeStyle = { position: 'absolute' };

  if (isNumber(width)) {
    resizeStyle.width = width;
  }
  if (isNumber(height)) {
    resizeStyle.height = height;
  }

  element = (
    <div ref={resizeRef} style={resizeStyle}>
      {element}
    </div>
  );

  if (size) {
    elemStyle.width = size.width;
    elemStyle.height = size.height;
  } else {
    element = <div style={{ position: 'absolute' }}>{element}</div>;
  }

  if (divProps.style) {
    Object.assign(elemStyle, divProps.style);
  }
  divProps.style = elemStyle;

  return (
    <PadContext.Provider value={{ ...context, resizeContent }}>
      <div {...divProps}>{element}</div>
    </PadContext.Provider>
  );
}

ItemContent.defaultProps = defaultItemContentProps;
ItemContent.PadContent = true;

export default ItemContent;
