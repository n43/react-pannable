import React, {
  forwardRef,
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
  useMemo,
  useImperativeHandle,
} from 'react';
import PadContext from './PadContext';
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
  const context = useContext(PadContext);
  const [size, setSize] = useState(null);
  const resizeRef = useRef(null);
  const eventRef = useRef({ size });

  const resizeContent = useCallback(() => {}, []);
  const getResizeNode = useCallback(() => resizeRef.current, []);
  const calculateSize = useCallback(() => {
    const nextSize = getElementSize(resizeRef.current);

    setSize(nextSize);
  }, []);

  useEffect(() => {
    const { size: prevSize } = eventRef.current;

    eventRef.current.size = size;

    if (!isEqualToSize(size, prevSize)) {
      if (size) {
        context.onContentResize(size);
      } else {
        calculateSize();
      }
    }
  });

  useMemo(() => {
    if (typeof width === 'number' && typeof height === 'number') {
      setSize({ width, height });
    }
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

  useImperativeHandle(ref, () => ({ getResizeNode, calculateSize }));

  return (
    <PadContext.Provider value={{ ...context, onContentResize: resizeContent }}>
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
