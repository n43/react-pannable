import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useContext,
} from 'react';
import PadContext from './PadContext';
import useIsomorphicLayoutEffect from './hooks/useIsomorphicLayoutEffect';
import usePrevRef from './hooks/usePrevRef';
import { getElementSize } from './utils/sizeGetter';
import { isEqualToSize } from './utils/geometry';

const defaultItemContentProps = {
  width: null,
  height: null,
};

function ItemContent({ width, height, ...props }) {
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

  useIsomorphicLayoutEffect(() => {}, []);

  useIsomorphicLayoutEffect(() => {
    if (!isEqualToSize(size, prevSize)) {
      if (size) {
        context.resizeContent(size);
      }
    }
    if (!size) {
      calculateSize();
    }
  });

  useMemo(() => {
    const nextSize =
      typeof width === 'number' && typeof height === 'number'
        ? { width, height }
        : null;
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

  props.style = { ...elemStyle, ...props.style };

  let element = props.children;

  if (typeof element === 'function') {
    element = element(size, { getResizeNode, calculateSize });
  }

  return (
    <PadContext.Provider value={{ ...context, resizeContent }}>
      <div {...props}>
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
