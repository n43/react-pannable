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
  ...props
}) {
  const context = useContext(PadContext);
  const [size, setSize] = useState(null);
  const resizeRef = useRef(null);
  const eventRef = useRef({ size });

  const prevSize = eventRef.current.size;

  eventRef.current.size = size;

  const onResize = useCallback(() => {}, []);
  const calculateSize = useCallback(() => {
    const nextSize = getElementSize(resizeRef.current);

    if (!isEqualToSize(nextSize, eventRef.current.size)) {
      setSize(nextSize);
    }
  }, []);

  useEffect(() => {
    if (size !== prevSize) {
      context.onContentResize(size);
    }
  });

  useEffect(() => {
    if (!size) {
      calculateSize();
    }
  }, [size, calculateSize]);

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

  return [
    <div {...props}>
      <div ref={resizeRef} style={resizeStyle}>
        <PadContext.Provider value={{ ...context, onContentResize: onResize }}>
          {props.children}
        </PadContext.Provider>
      </div>
    </div>,
    { size, resizeRef, calculateSize },
  ];
}
