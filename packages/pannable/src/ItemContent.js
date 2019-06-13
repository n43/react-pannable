import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useContext,
  useImperativeHandle,
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

const ItemContent = forwardRef(function(
  {
    width = defaultItemContentProps.width,
    height = defaultItemContentProps.height,
    ...props
  },
  ref
) {
  const [size, setSize] = useState(null);
  const prevSizeRef = usePrevRef(size);
  const sizeRef = useRef(size);
  const propsRef = useRef(defaultItemContentProps);
  const context = useContext(PadContext);
  const resizeRef = useRef(null);

  const prevProps = propsRef.current;
  propsRef.current = { width, height };
  sizeRef.current = size;

  const resizeContent = useCallback(() => {}, []);
  const getResizeNode = useCallback(() => resizeRef.current, []);
  const calculateSize = useCallback(() => {
    const nextSize = getElementSize(resizeRef.current);

    if (isEqualToSize(nextSize, sizeRef.current)) {
      return;
    }

    setSize(nextSize);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const prevSize = prevSizeRef.current;

    if (size !== prevSize) {
      if (size) {
        context.resizeContent(size);
      } else {
        calculateSize();
      }
    }
  });

  useImperativeHandle(ref, () => ({ getResizeNode, calculateSize }));

  if (width !== prevProps.width || height !== prevProps.height) {
    if (typeof width === 'number' && typeof height === 'number') {
      setSize({ width, height });
    } else {
      setSize(null);
    }
  }

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

  return (
    <PadContext.Provider value={{ ...context, resizeContent }}>
      <div {...props}>
        <div ref={resizeRef} style={resizeStyle}>
          {props.children}
        </div>
      </div>
    </PadContext.Provider>
  );
});

ItemContent.defaultProps = defaultItemContentProps;
ItemContent.PadContent = true;

export default ItemContent;
