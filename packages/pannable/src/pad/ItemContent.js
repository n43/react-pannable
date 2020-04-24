import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useContext,
  useEffect,
} from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import { isEqualToSize, isNumber } from '../utils/geometry';
import PadContext from './PadContext';

const defaultItemContentProps = {
  width: null,
  height: null,
};

function ItemContent(props) {
  const { width, height, children, ...divProps } = props;
  const context = useContext(PadContext);
  const [size, setSize] = useState(null);
  const prevSizeRef = usePrevRef(size);
  const prevSize = prevSizeRef.current;
  const resizeRef = useRef(null);
  const fixed = isNumber(width) && isNumber(height);

  const resizeContent = useCallback(() => {}, []);
  const getResizeNode = useCallback(() => resizeRef.current, []);
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
        context.resizeContent(size);
      }
    }
  });

  useEffect(() => {
    if (!size) {
      calculateSize(resizeRef.current);
    }
  }, [size, calculateSize]);

  useMemo(() => {
    let size = null;

    if (fixed) {
      size = { width, height };
    }

    setSize(prevSize => (isEqualToSize(prevSize, size) ? prevSize : size));
  }, [fixed, width, height]);

  const resizeStyle = { position: 'absolute' };

  if (isNumber(width)) {
    resizeStyle.width = width;
  }
  if (isNumber(height)) {
    resizeStyle.height = height;
  }

  const divStyle = { position: 'relative' };

  if (size) {
    divStyle.width = size.width;
    divStyle.height = size.height;
  }
  if (divProps.style) {
    Object.assign(divStyle, divProps.style);
  }
  divProps.style = divStyle;

  let element =
    typeof children === 'function'
      ? children(size, { getResizeNode, calculateSize })
      : children;

  if (!fixed) {
    element = (
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <div style={resizeStyle} ref={resizeRef}>
          {element}
        </div>
      </div>
    );
  }

  return (
    <PadContext.Provider value={{ ...context, resizeContent }}>
      <div {...divProps}>{element}</div>
    </PadContext.Provider>
  );
}

ItemContent.defaultProps = defaultItemContentProps;
ItemContent.PadContent = true;

export default ItemContent;
