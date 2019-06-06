import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
  useMemo,
} from 'react';
import PadContext from './PadContext';
import { getElementSize } from './utils/sizeGetter';
import { isEqualToSize } from './utils/geometry';

export const defaultItemContentProps = {
  width: null,
  height: null,
};

export function useItemContent({
  width = defaultItemContentProps.width,
  height = defaultItemContentProps.height,
}) {
  const context = useContext(PadContext);
  const [size, setSize] = useState(null);
  const resizeRef = useRef(null);
  const eventRef = useRef({ size });

  const resizeContent = useCallback(() => {}, []);
  const getResizeNode = useCallback(() => resizeRef.current, []);
  const calculateSize = useCallback(() => {
    console.log('calculateSize');
    const nextSize = getElementSize(resizeRef.current);

    setSize(prevSize =>
      isEqualToSize(nextSize, prevSize) ? prevSize : nextSize
    );
  }, []);

  useEffect(() => {
    const { size: prevSize } = eventRef.current;

    eventRef.current.size = size;

    if (size !== prevSize) {
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

  const props = {};

  props.style = elemStyle;
  props.render = children => (
    <PadContext.Provider value={{ ...context, onContentResize: resizeContent }}>
      <div ref={resizeRef} style={resizeStyle}>
        {children}
      </div>
    </PadContext.Provider>
  );

  return [props, { size, getResizeNode, calculateSize }];
}
